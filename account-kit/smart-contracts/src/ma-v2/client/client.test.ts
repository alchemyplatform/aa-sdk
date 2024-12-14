import { custom, parseEther, publicActions } from "viem";

import { LocalAccountSigner, type SmartAccountSigner } from "@aa-sdk/core";

import { createSMAV2AccountClient } from "./client.js";

import { local070InstanceOptSep } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import { installValidationActions } from "../actions/install-validation/installValidation.js";
import { addresses } from "../utils.js";
import { SingleSignerValidationModule } from "../modules/single-signer-validation/module.js";

describe("MA v2 Tests", async () => {
  const instance = local070InstanceOptSep;
  let client: ReturnType<typeof instance.getClient>;

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

  const getTargetBalance = async (): Promise<number> => {
    return client.getBalance({
      address: target,
    });
  };

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
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const result = await provider.installValidation({
      validationConfig: {
        address: addresses.singleSignerValidationModule,
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

    // connect session key
    provider.signer = sessionKey;
    provider.entityId = 1n;

    const result2 = await provider.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    txnHash = provider.waitForUserOperationTransaction(result);
    await expect(txnHash).resolves.not.toThrowError();

    await expect(await getTargetBalance()).toEqual(
      startingAddressBalance + sendAmount
    );
  });

  const givenConnectedProvider = async ({
    signer,
  }: {
    signer: SmartAccountSigner;
  }) =>
    createSMAV2AccountClient({
      chain: instance.chain,
      signer,
      transport: custom(instance.getClient()),
    });
});
