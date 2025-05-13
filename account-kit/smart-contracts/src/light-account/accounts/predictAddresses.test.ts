import {
  getAccountAddress,
  getEntryPoint,
  LocalAccountSigner,
} from "@aa-sdk/core";
import { concatHex, custom, encodeFunctionData, publicActions } from "viem";
import { predictLightAccountAddress } from "./predictAddress.js";
import { local060Instance, local070Instance } from "~test/instances.js";
import { createLightAccount } from "./account.js";
import { generatePrivateKey } from "viem/accounts";
import { LightAccountFactoryAbi_v1 } from "../abis/LightAccountFactoryAbi_v1.js";
import type { LightAccountVersion } from "../types.js";

describe("Light Account Counterfactual Address Tests", () => {
  const instanceV060 = local060Instance;
  const instanceV070 = local070Instance;

  it.each([
    "v1.0.1",
    "v1.0.2",
    "v1.1.0",
  ] as LightAccountVersion<"LightAccount">[])(
    "LAv1 should match the entrypoint generated counterfactual address",
    async (version) => {
      // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

      for (let i = 0; i < 20; i++) {
        const localSigner = LocalAccountSigner.privateKeyToAccountSigner(
          generatePrivateKey()
        );

        // Generate a random salt. The same generator function for private keys can be used, because it is also a 32 byte value.
        const salt = BigInt(generatePrivateKey());

        const chain = instanceV060.chain;
        const entryPoint = getEntryPoint(chain, {
          version: "0.6.0", // EP version, not LA version
        });

        const lightAccountV1 = await createLightAccount({
          transport: custom(instanceV060.getClient()),
          signer: localSigner,
          chain,
          salt,
          version,
        });

        // First, compute the address using the EntryPoint utility function:
        const entryPointComputedAddress = await getAccountAddress({
          client: instanceV060.getClient().extend(publicActions),
          entryPoint,
          // cannot use lightAccountV1.getInitCode, because it silently replaces salt with 0n for non-replay-safe-1271 account versions.
          getAccountInitCode: async () => {
            return concatHex([
              await lightAccountV1.getFactoryAddress(),
              encodeFunctionData({
                abi: LightAccountFactoryAbi_v1,
                functionName: "createAccount",
                args: [await localSigner.getAddress(), salt],
              }),
            ]);
          },
        });

        // Then, compute the address using the predictLightAccountAddress function:

        const locallyComputedAddress = await predictLightAccountAddress({
          factoryAddress: await lightAccountV1.getFactoryAddress(),
          salt,
          signerAddress: await localSigner.getAddress(),
          version,
        });

        expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
      }
    }
  );

  it("LAv2 should match the entrypoint generated counterfactual address", async () => {
    // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

    for (let i = 0; i < 20; i++) {
      const localSigner = LocalAccountSigner.privateKeyToAccountSigner(
        generatePrivateKey()
      );

      // Generate a random salt. The same generator function for private keys can be used, because it is also a 32 byte value.
      const salt = BigInt(generatePrivateKey());

      const chain = instanceV070.chain;
      const entryPoint = getEntryPoint(chain, {
        version: "0.7.0", // EP version, not LA version
      });

      const lightAccountV2 = await createLightAccount({
        transport: custom(instanceV070.getClient()),
        signer: localSigner,
        chain,
        salt,
        version: "v2.0.0",
      });

      // First, compute the address using the EntryPoint utility function:
      const entryPointComputedAddress = await getAccountAddress({
        client: instanceV070.getClient().extend(publicActions),
        entryPoint,
        // Can use the lightAccountV2.getInitCode, because it is replay-safe.
        getAccountInitCode: lightAccountV2.getInitCode,
      });

      // Then, compute the address using the predictLightAccountAddress function:
      const locallyComputedAddress = await predictLightAccountAddress({
        factoryAddress: await lightAccountV2.getFactoryAddress(),
        salt,
        signerAddress: await localSigner.getAddress(),
        version: "v2.0.0",
      });

      expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
    }
  });
});
