import {
  createWalletClient,
  custom,
  hexToBigInt,
  encodeFunctionData,
  concatHex,
  type LocalAccount,
  type Address,
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
import { LightAccountFactoryAbi_v2 } from "./abis/LightAccountFactoryAbi_v2.js";
import { MultiOwnerLightAccountFactoryAbi } from "./abis/MultiOwnerLightAccountFactoryAbi.js";
import { toLightAccount } from "./accounts/account.js";
import { toMultiOwnerLightAccount } from "./accounts/multi-owner-account.js";
import {
  getLightAccountAddressFromFactoryData,
  getMultiOwnerLightAccountAddressFromFactoryData,
  predictLightAccountAddress,
  predictMultiOwnerLightAccountAddress,
} from "./predictAddress.js";
import {
  AccountVersionRegistry,
  type LightAccountVersion,
} from "./registry.js";
import { getAccountAddressViaEntryPoint } from "../test-utils/getAccountAddressViaEntryPoint.js";
import * as utils from "../utils.js";

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

describe("getLightAccountAddressFromFactoryData", () => {
  const instanceV070 = localInstance;

  it("should decode factory data and predict address for default factory", async () => {
    const localSigner = createWalletClient({
      account: privateKeyToAccount(generatePrivateKey()),
      transport: custom(instanceV070.getClient()),
      chain: instanceV070.chain,
    });

    const salt = BigInt(generatePrivateKey());
    const ownerAddress = localSigner.account.address;
    const factoryAddress =
      AccountVersionRegistry["LightAccount"]["v2.0.0"].factoryAddress;

    const factoryData = encodeFunctionData({
      abi: LightAccountFactoryAbi_v2,
      functionName: "createAccount",
      args: [ownerAddress, salt],
    });

    // Spy on getSenderFromFactoryData to ensure it's NOT called
    const getSenderSpy = vi.spyOn(utils, "getSenderFromFactoryData");

    const address = await getLightAccountAddressFromFactoryData({
      client: instanceV070.getClient(),
      factoryAddress,
      factoryData,
      entryPoint: AccountVersionRegistry["LightAccount"]["v2.0.0"].entryPoint,
      version: "v2.0.0",
    });

    // Should use local prediction, not RPC
    expect(getSenderSpy).not.toHaveBeenCalled();

    // Verify the address matches the direct prediction
    const expectedAddress = predictLightAccountAddress({
      factoryAddress,
      salt,
      ownerAddress,
      version: "v2.0.0",
    });
    expect(address).toEqual(expectedAddress);

    getSenderSpy.mockRestore();
  });

  it("should fall back to RPC for non-default factory", async () => {
    const localSigner = createWalletClient({
      account: privateKeyToAccount(generatePrivateKey()),
      transport: custom(instanceV070.getClient()),
      chain: instanceV070.chain,
    });

    const salt = BigInt(generatePrivateKey());
    const ownerAddress = localSigner.account.address;
    // Use a non-default factory address
    const nonDefaultFactory =
      "0x1234567890123456789012345678901234567890" as Address;

    const factoryData = encodeFunctionData({
      abi: LightAccountFactoryAbi_v2,
      functionName: "createAccount",
      args: [ownerAddress, salt],
    });

    // Mock getSenderFromFactoryData to return a known address
    const mockAddress = "0xabcdef1234567890abcdef1234567890abcdef12" as Address;
    const getSenderSpy = vi
      .spyOn(utils, "getSenderFromFactoryData")
      .mockResolvedValue(mockAddress);

    const address = await getLightAccountAddressFromFactoryData({
      client: instanceV070.getClient(),
      factoryAddress: nonDefaultFactory,
      factoryData,
      entryPoint: AccountVersionRegistry["LightAccount"]["v2.0.0"].entryPoint,
      version: "v2.0.0",
    });

    // Should fall back to RPC
    expect(getSenderSpy).toHaveBeenCalledOnce();
    expect(address).toEqual(mockAddress);

    getSenderSpy.mockRestore();
  });
});

describe("getMultiOwnerLightAccountAddressFromFactoryData", () => {
  const instanceV070 = localInstance;

  it("should decode factory data and predict address for default factory", async () => {
    const localSigner = createWalletClient({
      account: privateKeyToAccount(generatePrivateKey()),
      transport: custom(instanceV070.getClient()),
      chain: instanceV070.chain,
    });

    const salt = BigInt(generatePrivateKey());
    const ownerAddresses = [localSigner.account.address].sort((a, b) => {
      const bigintA = hexToBigInt(a);
      const bigintB = hexToBigInt(b);
      return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
    });
    const factoryAddress =
      AccountVersionRegistry["MultiOwnerLightAccount"]["v2.0.0"].factoryAddress;

    const factoryData = encodeFunctionData({
      abi: MultiOwnerLightAccountFactoryAbi,
      functionName: "createAccount",
      args: [ownerAddresses, salt],
    });

    // Spy on getSenderFromFactoryData to ensure it's NOT called
    const getSenderSpy = vi.spyOn(utils, "getSenderFromFactoryData");

    const address = await getMultiOwnerLightAccountAddressFromFactoryData({
      client: instanceV070.getClient(),
      factoryAddress,
      factoryData,
      entryPoint:
        AccountVersionRegistry["MultiOwnerLightAccount"]["v2.0.0"].entryPoint,
    });

    // Should use local prediction, not RPC
    expect(getSenderSpy).not.toHaveBeenCalled();

    // Verify the address matches the direct prediction
    const expectedAddress = predictMultiOwnerLightAccountAddress({
      factoryAddress,
      salt,
      ownerAddresses,
    });
    expect(address).toEqual(expectedAddress);

    getSenderSpy.mockRestore();
  });

  it("should fall back to RPC for non-default factory", async () => {
    const localSigner = createWalletClient({
      account: privateKeyToAccount(generatePrivateKey()),
      transport: custom(instanceV070.getClient()),
      chain: instanceV070.chain,
    });

    const salt = BigInt(generatePrivateKey());
    const ownerAddresses = [localSigner.account.address];
    // Use a non-default factory address
    const nonDefaultFactory =
      "0x1234567890123456789012345678901234567890" as Address;

    const factoryData = encodeFunctionData({
      abi: MultiOwnerLightAccountFactoryAbi,
      functionName: "createAccount",
      args: [ownerAddresses, salt],
    });

    // Mock getSenderFromFactoryData to return a known address
    const mockAddress = "0xabcdef1234567890abcdef1234567890abcdef12" as Address;
    const getSenderSpy = vi
      .spyOn(utils, "getSenderFromFactoryData")
      .mockResolvedValue(mockAddress);

    const address = await getMultiOwnerLightAccountAddressFromFactoryData({
      client: instanceV070.getClient(),
      factoryAddress: nonDefaultFactory,
      factoryData,
      entryPoint:
        AccountVersionRegistry["MultiOwnerLightAccount"]["v2.0.0"].entryPoint,
    });

    // Should fall back to RPC
    expect(getSenderSpy).toHaveBeenCalledOnce();
    expect(address).toEqual(mockAddress);

    getSenderSpy.mockRestore();
  });
});
