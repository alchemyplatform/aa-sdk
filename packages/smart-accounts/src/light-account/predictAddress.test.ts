import {
  createWalletClient,
  custom,
  hexToBigInt,
  encodeFunctionData,
  concatHex,
  type LocalAccount,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  entryPoint06Address,
  entryPoint07Address,
  entryPoint06Abi,
  entryPoint07Abi,
} from "viem/account-abstraction";
import { localInstance } from "~test/instances.js";
import { LightAccountFactoryAbi_v1 } from "./abis/LightAccountFactoryAbi_v1.js";
import { toLightAccount } from "./accounts/account.js";
import { toMultiOwnerLightAccount } from "./accounts/multi-owner-account.js";
import {
  predictLightAccountAddress,
  predictMultiOwnerLightAccountAddress,
} from "./predictAddress.js";
import type { LightAccountVersion } from "./registry.js";
import { getAccountAddressViaEntryPoint } from "../test-utils/getAccountAddressViaEntryPoint.js";

describe("Light Account Counterfactual Address Tests", () => {
  it.each([
    "v1.0.1",
    "v1.0.2",
    "v1.1.0",
  ] as LightAccountVersion<"LightAccount">[])(
    "LAv1 should match the entrypoint generated counterfactual address",
    async (version) => {
      // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

      for (let i = 0; i < 20; i++) {
        const localSigner = createWalletClient({
          account: privateKeyToAccount(generatePrivateKey()),
          transport: custom(localInstance.getClient()),
          chain: localInstance.chain,
        });

        // Generate a random salt. The same generator function for private keys can be used, because it is also a 32 byte value.
        const salt = BigInt(generatePrivateKey());

        const lightAccountV1 = await toLightAccount({
          client: localSigner,
          owner: localSigner.account,
          salt,
          version,
        });

        // Compute the address using the EntryPoint's getSenderAddress function
        const entryPointComputedAddress = await getAccountAddressViaEntryPoint({
          client: localInstance.getClient(),
          entryPointAddress: entryPoint06Address,
          entryPointAbi: entryPoint06Abi,
          getAccountInitCode: async () => {
            return concatHex([
              (await lightAccountV1.getFactoryArgs()).factory!,
              encodeFunctionData({
                abi: LightAccountFactoryAbi_v1,
                functionName: "createAccount",
                args: [localSigner.account.address, salt],
              }),
            ]);
          },
        });

        // Then, compute the address using the predictLightAccountAddress function:

        const locallyComputedAddress = predictLightAccountAddress({
          factoryAddress: (await lightAccountV1.getFactoryArgs()).factory!,
          salt,
          ownerAddress: localSigner.account.address,
          version,
        });

        expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
      }
    },
  );

  it("LAv2 should match the entrypoint generated counterfactual address", async () => {
    // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

    for (let i = 0; i < 20; i++) {
      const localSigner = createWalletClient({
        account: privateKeyToAccount(generatePrivateKey()),
        transport: custom(localInstance.getClient()),
        chain: localInstance.chain,
      });

      // Generate a random salt. The same generator function for private keys can be used, because it is also a 32 byte value.
      const salt = BigInt(generatePrivateKey());

      const lightAccountV2 = await toLightAccount({
        client: localSigner,
        owner: localSigner.account,
        salt,
        version: "v2.0.0",
      });

      // Compute the address using the EntryPoint's getSenderAddress function
      const entryPointComputedAddress = await getAccountAddressViaEntryPoint({
        client: localInstance.getClient(),
        entryPointAddress: entryPoint07Address,
        entryPointAbi: entryPoint07Abi,
        getAccountInitCode: async () => {
          return concatHex([
            (await lightAccountV2.getFactoryArgs()).factory!,
            (await lightAccountV2.getFactoryArgs()).factoryData!,
          ]);
        },
      });

      // Then, compute the address using the predictLightAccountAddress function:
      const locallyComputedAddress = predictLightAccountAddress({
        factoryAddress: (await lightAccountV2.getFactoryArgs()).factory!,
        salt,
        ownerAddress: localSigner.account.address,
        version: "v2.0.0",
      });

      expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
    }
  });

  it("MOLAv2 should match the entrypoint generated counterfactual address", async () => {
    // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

    for (let i = 0; i < 20; i++) {
      const localSigner = createWalletClient({
        account: privateKeyToAccount(generatePrivateKey()),
        transport: custom(localInstance.getClient()),
        chain: localInstance.chain,
      });

      const signerAddress = localSigner.account.address;

      // Generate `i` random other owners.
      const otherOwners: LocalAccount[] = Array.from({ length: i }, () =>
        privateKeyToAccount(generatePrivateKey()),
      );

      // Generate a random salt. The same generator function for private keys can be used, because it is also a 32 byte value.
      const salt = BigInt(generatePrivateKey());

      const multiOwnerLightAccount = await toMultiOwnerLightAccount({
        client: localSigner,
        owners: [localSigner.account, ...otherOwners],
        salt,
        accountAddress: undefined,
      });

      // Compute the address using the EntryPoint's getSenderAddress function
      const entryPointComputedAddress = await getAccountAddressViaEntryPoint({
        client: localInstance.getClient(),
        entryPointAddress: entryPoint07Address,
        entryPointAbi: entryPoint07Abi,
        getAccountInitCode: async () => {
          return concatHex([
            (await multiOwnerLightAccount.getFactoryArgs()).factory!,
            (await multiOwnerLightAccount.getFactoryArgs()).factoryData!,
          ]);
        },
      });

      // Then, compute the address using the predictLightAccountAddress function.
      // We must first run the logic to include the signer address, dedepe, and sort.

      const owners_ = Array.from(
        new Set([...otherOwners.map((it) => it.address), signerAddress]),
      )
        .filter((x) => hexToBigInt(x) !== 0n)
        .sort((a, b) => {
          const bigintA = hexToBigInt(a);
          const bigintB = hexToBigInt(b);

          return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
        });

      const locallyComputedAddress = predictMultiOwnerLightAccountAddress({
        factoryAddress: (await multiOwnerLightAccount.getFactoryArgs())
          .factory!,
        salt,
        ownerAddresses: owners_,
      });

      expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
    }
  });
});
