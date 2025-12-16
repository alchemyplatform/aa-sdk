import {
  custom,
  createWalletClient,
  encodeFunctionData,
  concatHex,
  type Address,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  createWebAuthnCredential,
  toWebAuthnAccount,
  entryPoint07Address,
  entryPoint07Abi,
} from "viem/account-abstraction";
import { parsePublicKey, serializePublicKey } from "webauthn-p256";
import { local070Instance } from "~test/instances.js";
import { SoftWebauthnDevice } from "~test/webauthn.js";
import { toModularAccountV2 } from "./accounts/account.js";
import {
  getModularAccountV2AddressFromFactoryData,
  predictModularAccountV2Address,
} from "./predictAddress.js";
import { accountFactoryAbi } from "./abis/accountFactoryAbi.js";
import { webAuthnFactoryAbi } from "./abis/webAuthnFactoryAbi.js";
import { DefaultAddress } from "./utils/account.js";
import { getAccountAddressViaEntryPoint } from "../test-utils/getAccountAddressViaEntryPoint.js";
import * as utils from "../utils.js";

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

      const modularAccountV2 = await toModularAccountV2({
        client: localSigner,
        owner: localSigner.account,
        salt,
        mode: "default",
      });

      // Compute the address using the EntryPoint's getSenderAddress function
      const entryPointComputedAddress = await getAccountAddressViaEntryPoint({
        client: instanceV070.getClient(),
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

  it("MAv2 WebAuthn should match the entrypoint generated counterfactual address", async () => {
    // Repeat 20 times, with a randomized webauthn credential and salt. Pseudo-fuzzing.

    for (let i = 0; i < 20; i++) {
      const chain = instanceV070.chain;

      // Create a WebAuthn credential for testing
      const webauthnDevice = new SoftWebauthnDevice();

      const credential = await createWebAuthnCredential({
        rp: { id: "localhost", name: "localhost" },
        createFn: (opts) => webauthnDevice.create(opts, "localhost"),
        user: { name: "test", displayName: "test" },
      });

      const webauthnAccount = toWebAuthnAccount({ credential });

      // Generate a random salt. The same generator function for private keys can be used, because it is also a 32 byte value.
      const salt = BigInt(generatePrivateKey());

      const entityId = 0;

      const modularAccountV2 = await toModularAccountV2({
        client: createWalletClient({
          transport: custom(instanceV070.getClient()),
          chain,
        }),
        owner: webauthnAccount,
        salt,
      });

      // Compute the address using the EntryPoint's getSenderAddress function
      const { x, y } = parsePublicKey(credential.publicKey);
      const entryPointComputedAddress = await getAccountAddressViaEntryPoint({
        client: instanceV070.getClient(),
        entryPointAddress: entryPoint07Address,
        entryPointAbi: entryPoint07Abi,
        getAccountInitCode: async () => {
          const { factory } = await modularAccountV2.getFactoryArgs();
          const factoryData = encodeFunctionData({
            abi: webAuthnFactoryAbi,
            functionName: "createWebAuthnAccount",
            args: [x, y, salt, entityId],
          });
          return concatHex([factory!, factoryData]);
        },
      });

      const locallyComputedAddress = predictModularAccountV2Address({
        type: "WebAuthn",
        factoryAddress: DefaultAddress.MAV2_FACTORY_WEBAUTHN,
        implementationAddress: DefaultAddress.MAV2,
        ownerPublicKey: credential.publicKey,
        salt,
        entityId,
      });

      expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
    }
  });
});

describe("getModularAccountV2AddressFromFactoryData", () => {
  const instanceV070 = local070Instance;

  describe("SMA factory", () => {
    it("should decode factory data and predict address for default factory", async () => {
      const localSigner = createWalletClient({
        account: privateKeyToAccount(generatePrivateKey()),
        transport: custom(instanceV070.getClient()),
        chain: instanceV070.chain,
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
        client: instanceV070.getClient(),
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
        transport: custom(instanceV070.getClient()),
        chain: instanceV070.chain,
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
        client: instanceV070.getClient(),
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

  describe("WebAuthn factory", () => {
    it("should decode factory data and predict address for default factory", async () => {
      const webauthnDevice = new SoftWebauthnDevice();
      const credential = await createWebAuthnCredential({
        rp: { id: "localhost", name: "localhost" },
        createFn: (opts) => webauthnDevice.create(opts, "localhost"),
        user: { name: "test", displayName: "test" },
      });

      const salt = BigInt(generatePrivateKey());
      const entityId = 0;
      const { x, y } = parsePublicKey(credential.publicKey);

      const factoryData = encodeFunctionData({
        abi: webAuthnFactoryAbi,
        functionName: "createWebAuthnAccount",
        args: [x, y, salt, entityId],
      });

      // Spy on getSenderFromFactoryData to ensure it's NOT called
      const getSenderSpy = vi.spyOn(utils, "getSenderFromFactoryData");

      const address = await getModularAccountV2AddressFromFactoryData({
        client: instanceV070.getClient(),
        factoryAddress: DefaultAddress.MAV2_FACTORY_WEBAUTHN,
        factoryData,
        implementationAddress: DefaultAddress.MAV2,
        entityId,
      });

      // Should use local prediction, not RPC
      expect(getSenderSpy).not.toHaveBeenCalled();

      // Verify the address matches the direct prediction
      const expectedAddress = predictModularAccountV2Address({
        factoryAddress: DefaultAddress.MAV2_FACTORY_WEBAUTHN,
        implementationAddress: DefaultAddress.MAV2,
        salt,
        type: "WebAuthn",
        ownerPublicKey: serializePublicKey({ x, y }),
        entityId,
      });
      expect(address).toEqual(expectedAddress);

      getSenderSpy.mockRestore();
    });

    it("should fall back to RPC for non-default factory", async () => {
      const webauthnDevice = new SoftWebauthnDevice();
      const credential = await createWebAuthnCredential({
        rp: { id: "localhost", name: "localhost" },
        createFn: (opts) => webauthnDevice.create(opts, "localhost"),
        user: { name: "test", displayName: "test" },
      });

      const salt = BigInt(generatePrivateKey());
      const entityId = 0;
      const { x, y } = parsePublicKey(credential.publicKey);
      // Use a non-default factory address
      const nonDefaultFactory =
        "0x1234567890123456789012345678901234567890" as Address;

      const factoryData = encodeFunctionData({
        abi: webAuthnFactoryAbi,
        functionName: "createWebAuthnAccount",
        args: [x, y, salt, entityId],
      });

      // Mock getSenderFromFactoryData to return a known address
      const mockAddress =
        "0xabcdef1234567890abcdef1234567890abcdef12" as Address;
      const getSenderSpy = vi
        .spyOn(utils, "getSenderFromFactoryData")
        .mockResolvedValue(mockAddress);

      const address = await getModularAccountV2AddressFromFactoryData({
        client: instanceV070.getClient(),
        factoryAddress: nonDefaultFactory,
        factoryData,
        implementationAddress: DefaultAddress.MAV2,
        entityId,
      });

      // Should fall back to RPC
      expect(getSenderSpy).toHaveBeenCalledOnce();
      expect(address).toEqual(mockAddress);

      getSenderSpy.mockRestore();
    });
  });
});
