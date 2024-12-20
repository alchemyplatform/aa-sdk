import { custom, parseEther, publicActions } from "viem";

import { LocalAccountSigner, type SmartAccountSigner } from "@aa-sdk/core";

import { createSMAV2AccountClient } from "./client.js";

import { local070Instance } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import { installValidationActions } from "../actions/install-validation/installValidation.js";
import { getDefaultSingleSignerValidationModuleAddress } from "../modules/utils.js";
import { SingleSignerValidationModule } from "../modules/single-signer-validation/module.js";

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

    await provider.waitForUserOperationTransaction(result);

    await expect(getTargetBalance()).resolves.toEqual(
      startingAddressBalance + sendAmount
    );
  });

  it("adds a session key with no permissions", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

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
      signerEntity: { entityId: 1, isGlobalValidation: true },
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
    await expect(getTargetBalance()).resolves.toEqual(
      startingAddressBalance + sendAmount
    );
  });

  it("uninstalls a session key", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

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
      signerEntity: { entityId: 1, isGlobalValidation: true },
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

  const givenConnectedProvider = async ({
    signer,
    accountAddress,
  }: {
    signer: SmartAccountSigner;
    accountAddress?: `0x${string}`;
  }) =>
    createSMAV2AccountClient({
      chain: instance.chain,
      signer,
      accountAddress,
      transport: custom(instance.getClient()),
    });
});
