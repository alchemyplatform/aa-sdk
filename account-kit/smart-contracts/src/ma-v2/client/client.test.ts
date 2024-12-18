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
import { getDefaultSingleSignerValidationModuleAddress } from "../modules/utils.js";
import { SingleSignerValidationModule } from "../modules/single-signer-validation/module.js";
import { allowlistModule } from "../modules/allowlist-module/module.js";
import { HookType } from "../actions/common/types.js";
import { nativeTokenLimitModule } from "../modules/native-token-limit-module/module.js";

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

  it("installs allowlist module, then uninstalls", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const hookInstallData = allowlistModule.encodeOnInstallData({
      entityId: 1,
      inputs: [
        {
          target,
          hasSelectorAllowlist: false,
          hasERC20SpendLimit: false,
          erc20SpendLimit: 0n,
          selectors: [],
        },
      ],
    });

    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: zeroAddress,
        entityId: 0,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: "0x",
      hooks: [
        {
          hookConfig: {
            address: addresses.allowlistModule,
            entityId: 0, // uint32
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: true,
          },
          initData: hookInstallData,
        },
      ],
    });

    await expect(
      provider.waitForUserOperationTransaction(installResult)
    ).resolves.not.toThrowError();

    const hookUninstallData = allowlistModule.encodeOnUninstallData({
      entityId: 0,
      inputs: [
        {
          target,
          hasSelectorAllowlist: false,
          hasERC20SpendLimit: false,
          erc20SpendLimit: 0n,
          selectors: [],
        },
      ],
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: zeroAddress,
      entityId: 0,
      uninstallData: "0x",
      hookUninstallDatas: [hookUninstallData],
    });

    await expect(
      provider.waitForUserOperationTransaction(uninstallResult)
    ).resolves.not.toThrowError();
  });

  it.only("installs native token limit module, then uninstalls", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const spendLimit = parseEther("0.1"); // 0.1 ETH limit
    const hookInstallData = nativeTokenLimitModule.encodeOnInstallData({
      entityId: 1,
      spendLimit,
    });

    const installResult = await provider.installValidation({
      validationConfig: {
        // TODO: Make this a constant "FALLBACK_VALIDATION_CONFIG or something"
        moduleAddress: zeroAddress,
        entityId: 0,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: "0x",
      hooks: [
        {
          hookConfig: {
            address: addresses.nativeTokenLimitModule,
            entityId: 0,
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: false,
          },
          initData: hookInstallData,
        },
      ],
    });

    await expect(
      provider.waitForUserOperationTransaction(installResult)
    ).resolves.not.toThrowError();

    // Try to send more than the limit - should fail
    await expect(
      provider.sendUserOperation({
        uo: {
          target: target,
          value: parseEther("0.2"), // Try to send 0.2 ETH, above the 0.1 limit
          data: "0x",
        },
      })
    ).rejects.toThrowError();

    // Try to send less than the limit - should succeed
    const sendResult = await provider.sendUserOperation({
      uo: {
        target: target,
        value: parseEther("0.05"), // Send 0.05 ETH, below the 0.1 limit
        data: "0x",
      },
    });

    // await expect(
    //   provider.waitForUserOperationTransaction(sendResult)
    // ).resolves.not.toThrowError();

    // // Now uninstall the module
    // const hookUninstallData = nativeTokenLimitModule.encodeOnUninstallData({
    //   entityId: 0,
    // });

    // const uninstallResult = await provider.uninstallValidation({
    //   moduleAddress: zeroAddress,
    //   entityId: 0,
    //   uninstallData: "0x",
    //   hookUninstallDatas: [hookUninstallData],
    // });

    // await expect(
    //   provider.waitForUserOperationTransaction(uninstallResult)
    // ).resolves.not.toThrowError();

    // // After uninstall, should be able to send more than the previous limit
    // const finalSendResult = await provider.sendUserOperation({
    //   uo: {
    //     target: target,
    //     value: parseEther("0.2"), // Now we can send 0.2 ETH
    //     data: "0x",
    //   },
    // });

    // await expect(
    //   provider.waitForUserOperationTransaction(finalSendResult)
    // ).resolves.not.toThrowError();
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
