import type { SmartAccountSigner } from "@aa-sdk/core";
import {
  hashMessage,
  hashTypedData,
  concatHex,
  type Hex,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
  type Chain,
  type Address,
  concat,
} from "viem";
import {
  getDefaultSingleSignerValidationModuleAddress,
  SignatureType,
} from "../utils.js";

import { packUOSignature, pack1271Signature } from "../../utils.js";
/**
 * Creates an object with methods for generating a dummy signature, signing user operation hashes, signing messages, and signing typed data.
 *
 * @example 
 
 * ```ts
 * import { singleSignerMessageSigner } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 *
 * const MNEMONIC = "...":
 * 
 * const account = createModularAccountV2({ config });
 *
 * const signer = LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);
 *
 * const messageSigner = singleSignerMessageSigner(signer, chain, account.address, account.signerEntity.entityId);
 * ```
 *
 * @param {SmartAccountSigner} signer Signer to use for signing operations
 * @param {Chain} chain Chain object for the signer
 * @param {Address} accountAddress address of the smart account using this signer
 * @param {number} entityId the entity id of the signing validation
 * @returns {object} an object with methods for signing operations and managing signatures
 */
export const singleSignerMessageSigner = (
  signer: SmartAccountSigner,
  chain: Chain,
  accountAddress: Address,
  entityId: number
) => {
  return {
    getDummySignature: (): Hex => {
      const dummyEcdsaSignature =
        "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";

      return packUOSignature({
        // orderedHookData: [],
        validationSignature: dummyEcdsaSignature,
      });
    },

    signUserOperationHash: (uoHash: Hex): Promise<Hex> => {
      return signer.signMessage({ raw: uoHash }).then((signature: Hex) =>
        packUOSignature({
          // orderedHookData: [],
          validationSignature: signature,
        })
      );
    },

    // we apply the expected 1271 packing here since the account contract will expect it
    async signMessage({ message }: { message: SignableMessage }): Promise<Hex> {
      const hash = await hashMessage(message);

      return pack1271Signature({
        validationSignature: await signer.signTypedData({
          domain: {
            chainId: Number(chain.id),
            verifyingContract:
              getDefaultSingleSignerValidationModuleAddress(chain),
            salt: concatHex([`0x${"00".repeat(12)}`, accountAddress]),
          },
          types: {
            ReplaySafeHash: [{ name: "hash", type: "bytes32" }],
          },
          message: {
            hash,
          },
          primaryType: "ReplaySafeHash",
        }),
        entityId,
      });
    },

    // TODO: maybe move "sign deferred actions" to a separate function?
    // we don't apply the expected 1271 packing since deferred sigs use typed data sigs and don't expect the 1271 packing
    signTypedData: async <
      const typedData extends TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>
    ): Promise<Hex> => {
      // the accounts domain already gives replay protection across accounts for deferred actions, so we don't need to apply another wrapping
      const isDeferredAction =
        typedDataDefinition?.primaryType === "DeferredAction" &&
        typedDataDefinition?.domain?.verifyingContract === accountAddress;

      const validationSignature = await signer.signTypedData({
        domain: {
          chainId: Number(chain.id),
          verifyingContract:
            getDefaultSingleSignerValidationModuleAddress(chain),
          salt: concatHex([`0x${"00".repeat(12)}`, accountAddress]),
        },
        types: {
          ReplaySafeHash: [{ name: "hash", type: "bytes32" }],
        },
        message: {
          hash: hashTypedData(typedDataDefinition),
        },
        primaryType: "ReplaySafeHash",
      });

      // TODO: Handle non-EOA signer case
      return isDeferredAction
        ? concat([SignatureType.EOA, validationSignature])
        : pack1271Signature({
            validationSignature,
            entityId,
          });
    },
  };
};
