import { custom, parseEther, type Address } from "viem";

import { LocalAccountSigner, type SmartAccountSigner } from "@aa-sdk/core";

import { createSingleSignerRIAccountClient } from "@account-kit/smart-contracts";

import { local070InstanceArbSep } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { resetBalance } from "~test/accounts.js";
import { accounts } from "~test/constants.js";

describe("6900 RI Account Tests", async () => {
  const instance = local070InstanceArbSep;

  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

  it("should successfully get counterfactual address", async () => {
    // console.log("instance.chain", instance.chain);

    const {
      account: { address },
    } = await givenConnectedProvider({
      signer,
    });

    expect(address).toMatchInlineSnapshot(
      '"0x16D3b5139De103C46EFce3Cbf5B582edF4a75710"'
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
