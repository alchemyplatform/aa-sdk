import { getAccountAddress, getEntryPoint } from "@aa-sdk/core"; // TODO(v5): remove core dep
import {
  custom,
  publicActions,
  createWalletClient,
  concatHex,
  encodeFunctionData,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { local070Instance } from "~test/instances.js";
import { toModularAccountV2 } from "./accounts/account.js";
import { predictModularAccountV2Address } from "./predictAddress.js";
import { DefaultAddress } from "./utils.js";
import { accountFactoryAbi } from "./abis/accountFactoryAbi.js";

describe("MAv2 Counterfactual Address Tests", () => {
  const instanceV070 = local070Instance;

  it("MAv2 should match the entrypoint generated counterfactual address", async () => {
    // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

    for (let i = 0; i < 20; i++) {
      const chain = instanceV070.chain;

      const localSigner = createWalletClient({
        account: privateKeyToAccount(generatePrivateKey()),
        transport: custom(instanceV070.getClient()),
        chain,
      });

      // Generate a random salt. The same generator function for private keys can be used, because it is also a 32 byte value.
      const salt = BigInt(generatePrivateKey());

      const entryPoint = getEntryPoint(chain, {
        version: "0.7.0",
      });

      const modularAccountV2 = await toModularAccountV2({
        client: localSigner,
        owner: localSigner.account,
        salt,
        mode: "default",
      });

      // First, compute the address using the EntryPoint utility function:
      const entryPointComputedAddress = await getAccountAddress({
        client: instanceV070.getClient().extend(publicActions),
        entryPoint,
        getAccountInitCode: async () => {
          return concatHex([
            (await modularAccountV2.getFactoryArgs()).factory!,
            encodeFunctionData({
              abi: accountFactoryAbi,
              functionName: "createSemiModularAccount",
              args: [localSigner.account.address, salt],
            }),
          ]);
        },
      });

      const locallyComputedAddress = predictModularAccountV2Address({
        factoryAddress: DefaultAddress.MAV2_FACTORY,
        implementationAddress: DefaultAddress.SMAV2_BYTECODE,
        salt,
        type: "SMA",
        ownerAddress: await localSigner.account.address,
      });

      expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
    }
  });
});
