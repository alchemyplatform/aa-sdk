import {
  getAccountAddress,
  getEntryPoint,
  LocalAccountSigner,
} from "@aa-sdk/core";
import {
  concatHex,
  custom,
  encodeFunctionData,
  hexToBigInt,
  publicActions,
  type Address,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { localInstance } from "~test/instances.js";
import { LightAccountFactoryAbi_v1 } from "../abis/LightAccountFactoryAbi_v1.js";
import type { LightAccountVersion } from "../types.js";
import { createLightAccount } from "./account.js";
import { createMultiOwnerLightAccount } from "./multiOwner.js";
import {
  predictLightAccountAddress,
  predictMultiOwnerLightAccountAddress,
} from "./predictAddress.js";

describe("Light Account Counterfactual Address Tests", () => {
  const instanceV060 = localInstance;
  const instanceV070 = localInstance;

  it.each([
    "v1.0.1",
    "v1.0.2",
    "v1.1.0",
  ] as LightAccountVersion<"LightAccount">[])(
    "LAv1 should match the entrypoint generated counterfactual address",
    async (version) => {
      // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

      for (let i = 0; i < 20; i++) {
        const localSigner =
          LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());

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

        const locallyComputedAddress = predictLightAccountAddress({
          factoryAddress: await lightAccountV1.getFactoryAddress(),
          salt,
          ownerAddress: await localSigner.getAddress(),
          version,
        });

        expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
      }
    },
  );

  it("LAv2 should match the entrypoint generated counterfactual address", async () => {
    // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

    for (let i = 0; i < 20; i++) {
      const localSigner =
        LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());

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
      const locallyComputedAddress = predictLightAccountAddress({
        factoryAddress: await lightAccountV2.getFactoryAddress(),
        salt,
        ownerAddress: await localSigner.getAddress(),
        version: "v2.0.0",
      });

      expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
    }
  });

  it("MOLAv2 should match the entrypoint generated counterfactual address", async () => {
    // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

    for (let i = 0; i < 20; i++) {
      const localSigner =
        LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());

      const signerAddress = await localSigner.getAddress();

      // Generate `i` random other owners.
      const otherOwners: Address[] = Array.from(
        { length: i },
        () => privateKeyToAccount(generatePrivateKey()).address,
      );

      // Generate a random salt. The same generator function for private keys can be used, because it is also a 32 byte value.
      const salt = BigInt(generatePrivateKey());

      const chain = instanceV070.chain;
      const entryPoint = getEntryPoint(chain, {
        version: "0.7.0", // EP version, not LA version
      });

      const multiOwnerLightAccount = await createMultiOwnerLightAccount({
        transport: custom(instanceV070.getClient()),
        signer: localSigner,
        owners: otherOwners,
        chain,
        salt,
        accountAddress: undefined,
      });

      // First, compute the address using the EntryPoint utility function:
      const entryPointComputedAddress = await getAccountAddress({
        client: instanceV070.getClient().extend(publicActions),
        entryPoint,
        // Can use the lightAccountV2.getInitCode, because it is replay-safe.
        getAccountInitCode: multiOwnerLightAccount.getInitCode,
      });

      // Then, compute the address using the predictLightAccountAddress function.
      // We must first run the logic to include the signer address, dedepe, and sort.

      const owners_ = Array.from(new Set([...otherOwners, signerAddress]))
        .filter((x) => hexToBigInt(x) !== 0n)
        .sort((a, b) => {
          const bigintA = hexToBigInt(a);
          const bigintB = hexToBigInt(b);

          return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
        });

      const locallyComputedAddress = predictMultiOwnerLightAccountAddress({
        factoryAddress: await multiOwnerLightAccount.getFactoryAddress(),
        salt,
        ownerAddresses: owners_,
      });

      expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
    }
  });
});
