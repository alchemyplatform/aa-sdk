import {
  custom,
  createWalletClient,
  encodeFunctionData,
  concatHex,
  type Address,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { entryPoint07Address, entryPoint07Abi } from "viem/account-abstraction";
import { localInstance } from "~test/instances.js";
import { toModularAccountV2 } from "./accounts/account.js";
import {
  getModularAccountV2AddressFromFactoryData,
  predictModularAccountV2Address,
} from "./predictAddress.js";
import { accountFactoryAbi } from "./abis/accountFactoryAbi.js";
import { DefaultAddress } from "./utils/account.js";
import { getAccountAddressViaEntryPoint } from "../test-utils/getAccountAddressViaEntryPoint.js";
import * as utils from "../utils.js";

describe("MAv2 Counterfactual Address Tests", () => {
  it("MAv2 should match the entrypoint generated counterfactual address", async () => {
    // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

    for (let i = 0; i < 20; i++) {
      const chain = localInstance.chain;

      const localSigner = createWalletClient({
        account: privateKeyToAccount(generatePrivateKey()),
        transport: custom(localInstance.getClient()),
        chain,
      });

      // Generate a random salt. The same generator function for private keys can be used, because it is also a 32 byte value.
      const salt = BigInt(generatePrivateKey());

      const modularAccountV2 = await toModularAccountV2({
        client: localSigner,
        owner: localSigner.account,
        salt,
        mode: "default",
      });

      // Compute the address using the EntryPoint's getSenderAddress function
      const entryPointComputedAddress = await getAccountAddressViaEntryPoint({
        client: localInstance.getClient(),
        entryPointAddress: entryPoint07Address,
        entryPointAbi: entryPoint07Abi,
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
        ownerAddress: localSigner.account.address,
      });

      expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
    }
  });
});

describe("getModularAccountV2AddressFromFactoryData", () => {
  const instance = localInstance;

  describe("SMA factory", () => {
    it("should decode factory data and predict address for default factory", async () => {
      const localSigner = createWalletClient({
        account: privateKeyToAccount(generatePrivateKey()),
        transport: custom(instance.getClient()),
        chain: instance.chain,
      });

      const salt = BigInt(generatePrivateKey());
      const ownerAddress = localSigner.account.address;

      const factoryData = encodeFunctionData({
        abi: accountFactoryAbi,
        functionName: "createSemiModularAccount",
        args: [ownerAddress, salt],
      });

      // Spy on getSenderFromFactoryData to ensure it's NOT called
      const getSenderSpy = vi.spyOn(utils, "getSenderFromFactoryData");

      const address = await getModularAccountV2AddressFromFactoryData({
        client: instance.getClient(),
        factoryAddress: DefaultAddress.MAV2_FACTORY,
        factoryData,
        implementationAddress: DefaultAddress.SMAV2_BYTECODE,
      });

      // Should use local prediction, not RPC
      expect(getSenderSpy).not.toHaveBeenCalled();

      // Verify the address matches the direct prediction
      const expectedAddress = predictModularAccountV2Address({
        factoryAddress: DefaultAddress.MAV2_FACTORY,
        implementationAddress: DefaultAddress.SMAV2_BYTECODE,
        salt,
        type: "SMA",
        ownerAddress,
      });
      expect(address).toEqual(expectedAddress);

      getSenderSpy.mockRestore();
    });

    it("should fall back to RPC for non-default factory", async () => {
      const localSigner = createWalletClient({
        account: privateKeyToAccount(generatePrivateKey()),
        transport: custom(instance.getClient()),
        chain: instance.chain,
      });

      const salt = BigInt(generatePrivateKey());
      const ownerAddress = localSigner.account.address;
      // Use a non-default factory address
      const nonDefaultFactory =
        "0x1234567890123456789012345678901234567890" as Address;

      const factoryData = encodeFunctionData({
        abi: accountFactoryAbi,
        functionName: "createSemiModularAccount",
        args: [ownerAddress, salt],
      });

      // Mock getSenderFromFactoryData to return a known address
      const mockAddress =
        "0xabcdef1234567890abcdef1234567890abcdef12" as Address;
      const getSenderSpy = vi
        .spyOn(utils, "getSenderFromFactoryData")
        .mockResolvedValue(mockAddress);

      const address = await getModularAccountV2AddressFromFactoryData({
        client: instance.getClient(),
        factoryAddress: nonDefaultFactory,
        factoryData,
        implementationAddress: DefaultAddress.SMAV2_BYTECODE,
      });

      // Should fall back to RPC
      expect(getSenderSpy).toHaveBeenCalledOnce();
      expect(address).toEqual(mockAddress);

      getSenderSpy.mockRestore();
    });
  });
});
