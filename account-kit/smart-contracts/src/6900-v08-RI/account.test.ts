import { custom, parseEther, publicActions, type Address } from "viem";

import { LocalAccountSigner, type SmartAccountSigner } from "@aa-sdk/core";

import { createSingleSignerRIAccountClient } from "@account-kit/smart-contracts";

import { local070InstanceArbSep } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";

describe("6900 RI Account Tests", async () => {
  const instance = local070InstanceArbSep;

  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

  it("should successfully get counterfactual address", async () => {
    const {
      account: { address },
    } = await givenConnectedProvider({
      signer,
    });

    expect(address).toMatchInlineSnapshot(
      '"0xb32077A16FBfA16333dC37483b1eeB546bcBCc1d"'
    );
  });

  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({ signer });
    const targetAddress = "0x000000000000000000000000000000000000dEaD";

    const client = instance.getClient().extend(publicActions);

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("1"),
    });

    const startingAddressBalance = await client.getBalance({
      address: targetAddress,
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: targetAddress,
        value: parseEther("0.5"),
        data: "0x",
      },
    });

    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();

    const newAddressBalance = await client.getBalance({
      address: targetAddress,
    });

    await expect(newAddressBalance).toEqual(
      startingAddressBalance + parseEther("0.5")
    );
  });

  it("shoud execute batch successfully", async () => {
    const provider = await givenConnectedProvider({ signer });
    const targetAddress1 = "0x000000000000000000000000000000000000dEaD";
    const targetAddress2 = "0x00000000000000000000000000000000dEadDEaD";

    const client = instance.getClient().extend(publicActions);

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const startingAddressBalance1 = await client.getBalance({
      address: targetAddress1,
    });

    const startingAddressBalance2 = await client.getBalance({
      address: targetAddress2,
    });

    const result = await provider.sendUserOperation({
      uo: [
        {
          target: targetAddress1,
          value: parseEther("0.5"),
          data: "0x",
        },
        {
          target: targetAddress2,
          value: parseEther("1"),
          data: "0x",
        },
      ],
    });

    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();

    const newAddressBalance1 = await client.getBalance({
      address: targetAddress1,
    });

    const newAddressBalance2 = await client.getBalance({
      address: targetAddress2,
    });

    await expect(newAddressBalance1).toEqual(
      startingAddressBalance1 + parseEther("0.5")
    );

    await expect(newAddressBalance2).toEqual(
      startingAddressBalance2 + parseEther("1")
    );
  });

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
