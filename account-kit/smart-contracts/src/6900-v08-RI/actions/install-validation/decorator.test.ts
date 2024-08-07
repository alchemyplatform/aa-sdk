import {
  custom,
  keccak256,
  parseEther,
  publicActions,
  toHex,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { LocalAccountSigner, type SmartAccountSigner } from "@aa-sdk/core";

import {
  createSingleSignerRIAccountClient,
  installValidationActions,
  SingleSignerValidationModule,
} from "@account-kit/smart-contracts";

import { local070InstanceArbSep } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";

describe("6900 RI installValidation Tests", async () => {
  const instance = local070InstanceArbSep;

  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

  it("should add a secondary signer and successfully execute", async () => {
    // Generate and add the secondary signer

    const secondarySigner = new LocalAccountSigner(
      privateKeyToAccount(keccak256(toHex("secondarySigner")))
    );

    const provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const entityId = 1;

    const result1 = await provider.installValidation({
      args: {
        validationConfig: {
          moduleAddress: SingleSignerValidationModule.meta.addresses.default,
          entityId,
          isGlobal: true,
          isSignatureValidation: true,
        },
        selectors: [],
        installData: SingleSignerValidationModule.encodeOnInstallData({
          entityId,
          signer: await secondarySigner.getAddress(),
        }),
        hooks: [],
      },
    });

    const txnHash1 = provider.waitForUserOperationTransaction(result1);

    await expect(txnHash1).resolves.not.toThrowError();

    // Now the new validation is installed, use it to execute.

    const accountAddress = provider.getAddress();

    const newValidationAccountClient = await createSingleSignerRIAccountClient({
      chain: instance.chain,
      signer: secondarySigner,
      accountAddress,
      entityId,
      transport: custom(instance.getClient()),
    });

    // Attempt to execute a transfer of 1 ETH from the account to a dead address.

    const targetAddress = "0x000000000000000000000000000000000000dEaD";

    const client = instance.getClient().extend(publicActions);

    const startingAddressBalance = await client.getBalance({
      address: targetAddress,
    });

    const result2 = await newValidationAccountClient.sendUserOperation({
      uo: {
        target: targetAddress,
        value: parseEther("0.5"),
        data: "0x",
      },
    });

    const txnHash2 =
      newValidationAccountClient.waitForUserOperationTransaction(result2);

    await expect(txnHash2).resolves.not.toThrowError();

    const newAddressBalance = await client.getBalance({
      address: targetAddress,
    });

    await expect(newAddressBalance).toEqual(
      startingAddressBalance + parseEther("0.5")
    );
  });

  it("should fail after uninstalling the secondary signer", async () => {
    // Generate and add the secondary signer

    const secondarySigner = new LocalAccountSigner(
      privateKeyToAccount(keccak256(toHex("secondarySigner2")))
    );

    const provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const entityId = 2;

    const result1 = await provider.installValidation({
      args: {
        validationConfig: {
          moduleAddress: SingleSignerValidationModule.meta.addresses.default,
          entityId,
          isGlobal: true,
          isSignatureValidation: true,
        },
        selectors: [],
        installData: SingleSignerValidationModule.encodeOnInstallData({
          entityId,
          signer: await secondarySigner.getAddress(),
        }),
        hooks: [],
      },
    });

    const txnHash1 = provider.waitForUserOperationTransaction(result1);

    await expect(txnHash1).resolves.not.toThrowError();

    // Now the new validation is installed, uninstall it

    const result2 = await provider.uninstallValidation({
      args: {
        moduleAddress: SingleSignerValidationModule.meta.addresses.default,
        entityId,
        uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
          entityId,
        }),
        hookUninstallDatas: [],
      },
    });

    const txnHash2 = provider.waitForUserOperationTransaction(result2);

    await expect(txnHash2).resolves.not.toThrowError();

    // Now the validation is uninstalled, attempt to use it to execute.

    const accountAddress = provider.getAddress();

    const newValidationAccountClient = await createSingleSignerRIAccountClient({
      chain: instance.chain,
      signer: secondarySigner,
      accountAddress,
      entityId,
      transport: custom(instance.getClient()),
    });

    // Attempt to execute a transfer of 1 ETH from the account to a dead address.

    const targetAddress = "0x000000000000000000000000000000000000dEaD";

    const result3 = newValidationAccountClient.sendUserOperation({
      uo: {
        target: targetAddress,
        value: parseEther("0.5"),
        data: "0x",
      },
    });

    await expect(result3).rejects.toThrowError();
  });

  // todo: consolidate this test setup into a common base
  const givenConnectedProvider = async ({
    signer,
    accountAddress,
  }: {
    signer: SmartAccountSigner;
    accountAddress?: Address;
  }) =>
    createSingleSignerRIAccountClient({
      chain: instance.chain,
      signer,
      accountAddress,
      transport: custom(instance.getClient()),
    });
});
