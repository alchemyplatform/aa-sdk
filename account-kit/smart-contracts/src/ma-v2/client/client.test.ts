import { custom, parseEther, publicActions } from "viem";

import { LocalAccountSigner, type SmartAccountSigner } from "@aa-sdk/core";

import { createSMAV2AccountClient } from "./client.js";

import { local070Instance } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";

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

  it("sends a simple UO", async () => {
    const provider = await givenConnectedProvider({ signer });

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const target = "0x000000000000000000000000000000000000dEaD";
    const sendAmount = parseEther("1");

    const startingAddressBalance = await client.getBalance({
      address: target,
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    await provider.waitForUserOperationTransaction(result);

    const newAddressBalance = await client.getBalance({
      address: target,
    });

    await expect(newAddressBalance).toEqual(
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
