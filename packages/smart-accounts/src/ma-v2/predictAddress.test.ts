import { getAccountAddress, getEntryPoint } from "@aa-sdk/core"; // TODO(v5): remove core dep
import {
  custom,
  publicActions,
  createWalletClient,
  concatHex,
  encodeFunctionData,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  createWebAuthnCredential,
  toWebAuthnAccount,
} from "viem/account-abstraction";
import { parsePublicKey } from "webauthn-p256";
import { local070Instance } from "~test/instances.js";
import { SoftWebauthnDevice } from "~test/webauthn.js";
import { toModularAccountV2 } from "./accounts/account.js";
import { predictModularAccountV2Address } from "./predictAddress.js";
import { accountFactoryAbi } from "./abis/accountFactoryAbi.js";
import { DefaultAddress } from "./utils/account.js";
import { webAuthnFactoryAbi } from "./abis/webAuthnFactoryAbi.js";

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

      const entryPoint = getEntryPoint(chain, {
        version: "0.7.0",
      });

      const modularAccountV2 = await toModularAccountV2({
        client: createWalletClient({
          transport: custom(instanceV070.getClient()),
          chain,
        }),
        owner: webauthnAccount,
        salt,
      });
      const locallyComputedAddress = predictModularAccountV2Address({
        type: "WebAuthn",
        factoryAddress: DefaultAddress.MAV2_FACTORY_WEBAUTHN,
        implementationAddress: DefaultAddress.MAV2,
        ownerPublicKey: credential.publicKey,
        salt,
        entityId,
      });

      // First, compute the address using the EntryPoint utility function:
      const { x, y } = parsePublicKey(credential.publicKey);
      const getAccountInitCode = async () => {
        const { factory } = await modularAccountV2.getFactoryArgs();
        const factoryData = encodeFunctionData({
          abi: webAuthnFactoryAbi,
          functionName: "createWebAuthnAccount",
          args: [x, y, salt, entityId],
        });
        return concatHex([factory!, factoryData]);
      };
      const entryPointComputedAddress = await getAccountAddress({
        client: instanceV070.getClient().extend(publicActions),
        entryPoint,
        getAccountInitCode,
      });

      expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
    }
  });
});
