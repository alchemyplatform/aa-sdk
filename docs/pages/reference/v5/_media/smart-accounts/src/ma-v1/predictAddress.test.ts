import {
  custom,
  createWalletClient,
  concatHex,
  hexToBigInt,
  encodeFunctionData,
  type LocalAccount,
  type Address,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { entryPoint06Address, entryPoint06Abi } from "viem/account-abstraction";
import { localInstance } from "~test/instances.js";
import { toMultiOwnerModularAccountV1 } from "./accounts/multi-owner-account.js";
import {
  getMultiOwnerModularAccountV1AddressFromFactoryData,
  predictMultiOwnerModularAccountV1Address,
} from "./predictAddress.js";
import { DefaultMaV1Address } from "./account.js";
import { MultiOwnerModularAccountFactoryAbi } from "./abis/MultiOwnerModularAccountFactory.js";
import { getAccountAddressViaEntryPoint } from "../test-utils/getAccountAddressViaEntryPoint.js";
import * as utils from "../utils.js";

describe("MAv1 Counterfactual Address Tests", () => {
  it("Multi-Owner MAv1 should match the entrypoint generated counterfactual address", async () => {
    // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

    for (let i = 0; i < 20; i++) {
      const chain = localInstance.chain;

      const localSigner = createWalletClient({
        account: privateKeyToAccount(generatePrivateKey()),
        transport: custom(localInstance.getClient()),
        chain,
      });

      const signerAddress = localSigner.account.address;

      // Generate `i` random other owners.
      const otherOwners: LocalAccount[] = Array.from({ length: i }, () =>
        privateKeyToAccount(generatePrivateKey()),
      );

      // Generate a random salt. The same generator function for private keys can be used, because it is also a 32 byte value.
      const salt = BigInt(generatePrivateKey());

      const multiOwnerAccountV1 = await toMultiOwnerModularAccountV1({
        client: localSigner,
        owners: [localSigner.account, ...otherOwners],
        salt,
        accountAddress: undefined,
      });

      // Compute the address using the EntryPoint's getSenderAddress function
      const entryPointComputedAddress = await getAccountAddressViaEntryPoint({
        client: localInstance.getClient(),
        entryPointAddress: entryPoint06Address,
        entryPointAbi: entryPoint06Abi,
        getAccountInitCode: async () => {
          return concatHex([
            (await multiOwnerAccountV1.getFactoryArgs()).factory!,
            (await multiOwnerAccountV1.getFactoryArgs()).factoryData!,
          ]);
        },
      });

      // Then, compute the address using the predictMultiOwnerModularAccountV1Address function.
      // We must first run the logic to include the signer address, dedupe, and sort.

      const owners_ = Array.from(
        new Set([...otherOwners.map((it) => it.address), signerAddress]),
      )
        .filter((x) => hexToBigInt(x) !== 0n)
        .sort((a, b) => {
          const bigintA = hexToBigInt(a);
          const bigintB = hexToBigInt(b);

          return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
        });

      const locallyComputedAddress = predictMultiOwnerModularAccountV1Address({
        factoryAddress: DefaultMaV1Address.MULTI_OWNER_MAV1_FACTORY,
        salt,
        ownerAddresses: owners_,
      });

      expect(locallyComputedAddress).toEqual(entryPointComputedAddress);
    }
  });
});

describe("getMultiOwnerModularAccountV1AddressFromFactoryData", () => {
  const instanceV060 = localInstance;

  it("should decode factory data and predict address for default factory", async () => {
    const localSigner = createWalletClient({
      account: privateKeyToAccount(generatePrivateKey()),
      transport: custom(instanceV060.getClient()),
      chain: instanceV060.chain,
    });

    const salt = BigInt(generatePrivateKey());
    const ownerAddresses = [localSigner.account.address].sort((a, b) => {
      const bigintA = hexToBigInt(a);
      const bigintB = hexToBigInt(b);
      return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
    });

    const factoryData = encodeFunctionData({
      abi: MultiOwnerModularAccountFactoryAbi,
      functionName: "createAccount",
      args: [salt, ownerAddresses],
    });

    // Spy on getSenderFromFactoryData to ensure it's NOT called
    const getSenderSpy = vi.spyOn(utils, "getSenderFromFactoryData");

    const address = await getMultiOwnerModularAccountV1AddressFromFactoryData({
      client: instanceV060.getClient(),
      factoryAddress: DefaultMaV1Address.MULTI_OWNER_MAV1_FACTORY,
      factoryData,
      entryPoint: {
        version: "0.6",
        address: entryPoint06Address,
      },
    });

    // Should use local prediction, not RPC
    expect(getSenderSpy).not.toHaveBeenCalled();

    // Verify the address matches the direct prediction
    const expectedAddress = predictMultiOwnerModularAccountV1Address({
      factoryAddress: DefaultMaV1Address.MULTI_OWNER_MAV1_FACTORY,
      salt,
      ownerAddresses,
    });
    expect(address).toEqual(expectedAddress);

    getSenderSpy.mockRestore();
  });

  it("should fall back to RPC for non-default factory", async () => {
    const localSigner = createWalletClient({
      account: privateKeyToAccount(generatePrivateKey()),
      transport: custom(instanceV060.getClient()),
      chain: instanceV060.chain,
    });

    const salt = BigInt(generatePrivateKey());
    const ownerAddresses = [localSigner.account.address];
    // Use a non-default factory address
    const nonDefaultFactory =
      "0x1234567890123456789012345678901234567890" as Address;

    const factoryData = encodeFunctionData({
      abi: MultiOwnerModularAccountFactoryAbi,
      functionName: "createAccount",
      args: [salt, ownerAddresses],
    });

    // Mock getSenderFromFactoryData to return a known address
    const mockAddress = "0xabcdef1234567890abcdef1234567890abcdef12" as Address;
    const getSenderSpy = vi
      .spyOn(utils, "getSenderFromFactoryData")
      .mockResolvedValue(mockAddress);

    const address = await getMultiOwnerModularAccountV1AddressFromFactoryData({
      client: instanceV060.getClient(),
      factoryAddress: nonDefaultFactory,
      factoryData,
      entryPoint: {
        version: "0.6",
        address: entryPoint06Address,
      },
    });

    // Should fall back to RPC
    expect(getSenderSpy).toHaveBeenCalledOnce();
    expect(address).toEqual(mockAddress);

    getSenderSpy.mockRestore();
  });
});
