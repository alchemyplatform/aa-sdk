import { custom, parseEther, publicActions, zeroAddress } from "viem";

import {
  LocalAccountSigner,
  type SmartAccountSigner,
  type SmartAccountClient,
} from "@aa-sdk/core";

import {
  createSMAV2AccountClient,
  type InstallValidationActions,
} from "./client.js";

import { local070Instance } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import {
  getDefaultPaymasterGuardModuleAddress,
  getDefaultSingleSignerValidationModuleAddress,
  getDefaultTimeRangeModuleAddress,
} from "../modules/utils.js";
import { SingleSignerValidationModule } from "../modules/single-signer-validation/module.js";
import { PaymasterGuardModule } from "../modules/paymaster-guard-module/module.js";
import { paymaster070 } from "~test/paymaster/paymaster070.js";
import { HookType } from "../actions/common/types.js";
import { installValidationActions } from "../../../dist/esm/src/ma-v2/actions/install-validation/installValidation.js";
import { TimeRangeModule } from "../modules/time-range-module/module.js";

describe("MA v2 Tests", async () => {
  const instance = local070Instance;
  let client: ReturnType<typeof instance.getClient> &
    ReturnType<typeof publicActions>;

  beforeAll(async () => {
    client = instance.getClient().extend(publicActions);
  });

  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

  const sessionKey: SmartAccountSigner = new LocalAccountSigner(
    accounts.unfundedAccountOwner
  );

  const target = "0x000000000000000000000000000000000000dEaD";
  const sendAmount = parseEther("1");

  const getTargetBalance = async (): Promise<bigint> =>
    client.getBalance({
      address: target,
    });

  it("sends a simple UO", async () => {
    const provider = await givenConnectedProvider({ signer });

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const startingAddressBalance = await getTargetBalance();

    const result = await provider.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    const txnHash1 = provider.waitForUserOperationTransaction(result);
    await expect(txnHash1).resolves.not.toThrowError();

    await expect(await getTargetBalance()).toEqual(
      startingAddressBalance + sendAmount
    );
  });

  it("adds a session key with no permissions", async () => {
    let provider = await givenConnectedProvider({ signer });

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    let result = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });

    let txnHash = provider.waitForUserOperationTransaction(result);
    await expect(txnHash).resolves.not.toThrowError();

    const startingAddressBalance = await getTargetBalance();

    // connect session key and send tx with session key
    let sessionKeyClient = await createSMAV2AccountClient({
      chain: instance.chain,
      signer: sessionKey,
      transport: custom(instance.getClient()),
      accountAddress: provider.getAddress(),
      entityId: 1,
      isGlobalValidation: true,
    });

    result = await sessionKeyClient.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    txnHash = sessionKeyClient.waitForUserOperationTransaction(result);
    await expect(txnHash).resolves.not.toThrowError();
    await expect(await getTargetBalance()).toEqual(
      startingAddressBalance + sendAmount
    );
  });

  it("uninstalls a session key", async () => {
    let provider = await givenConnectedProvider({ signer });

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    let result = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });

    let txnHash = provider.waitForUserOperationTransaction(result);
    await expect(txnHash).resolves.not.toThrowError();

    result = await provider.uninstallValidation({
      moduleAddress: getDefaultSingleSignerValidationModuleAddress(
        provider.chain
      ),
      entityId: 1,
      uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
        entityId: 1,
      }),
      hookUninstallDatas: [],
    });

    txnHash = provider.waitForUserOperationTransaction(result);
    await expect(txnHash).resolves.not.toThrowError();

    // connect session key and send tx with session key
    let sessionKeyClient = await createSMAV2AccountClient({
      chain: instance.chain,
      signer: sessionKey,
      transport: custom(instance.getClient()),
      accountAddress: provider.getAddress(),
      entityId: 1,
      isGlobalValidation: true,
    });

    await expect(
      sessionKeyClient.sendUserOperation({
        uo: {
          target: target,
          value: sendAmount,
          data: "0x",
        },
      })
    ).rejects.toThrowError();
  });

  it("installs paymaster guard module, verifies use of valid paymaster, then uninstalls module", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const paymaster = paymaster070.getPaymasterStubData();

    const hookInstallData = PaymasterGuardModule.encodeOnInstallData({
      entityId: 1,
      paymaster: "paymaster" in paymaster ? paymaster.paymaster : "0x0", // dummy value for paymaster address if it DNE
    });

    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: zeroAddress,
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: "0x",
      hooks: [
        {
          hookConfig: {
            address: getDefaultPaymasterGuardModuleAddress(provider.chain),
            entityId: 0, // uint32
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: true,
          },
          initData: hookInstallData,
        },
      ],
    });

    // verify hook installtion succeeded
    await expect(
      provider.waitForUserOperationTransaction(installResult)
    ).resolves.not.toThrowError();

    // TO DO: verify if paymaster is valid

    const hookUninstallData = PaymasterGuardModule.encodeOnUninstallData({
      entityId: 1,
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: zeroAddress,
      entityId: 1,
      uninstallData: "0x",
      hookUninstallDatas: [hookUninstallData],
    });

    // verify uninstall
    await expect(
      provider.waitForUserOperationTransaction(uninstallResult)
    ).resolves.not.toThrowError();
  });

  it.only("installs time range module, verifies use of valid time range then uninstalls module", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const hookInstallData = TimeRangeModule.encodeOnInstallData({
      entityId: 1,
      validUntil: 100,
      validAfter: 100,
    });

    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: zeroAddress,
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: "0x",
      hooks: [
        {
          hookConfig: {
            address: getDefaultTimeRangeModuleAddress(provider.chain),
            entityId: 0, // uint32
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: true,
          },
          initData: hookInstallData,
        },
      ],
    });

    // verify hook installtion succeeded
    await expect(
      provider.waitForUserOperationTransaction(installResult)
    ).resolves.not.toThrowError();

    // TO DO: verify if time module works

    const hookUninstallData = TimeRangeModule.encodeOnUninstallData({
      entityId: 1,
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: zeroAddress,
      entityId: 1,
      uninstallData: "0x",
      hookUninstallDatas: [hookUninstallData],
    });

    // verify uninstall
    await expect(
      provider.waitForUserOperationTransaction(uninstallResult)
    ).resolves.not.toThrowError();
  });

  const givenConnectedProvider = async ({
    signer,
    accountAddress,
  }: {
    signer: SmartAccountSigner;
    accountAddress?: `0x${string}`;
  }): Promise<SmartAccountClient & InstallValidationActions> =>
    createSMAV2AccountClient({
      chain: instance.chain,
      signer,
      accountAddress,
      transport: custom(instance.getClient()),
    });
});
