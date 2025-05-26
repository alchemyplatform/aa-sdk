import type { SmartAccountSigner } from "@aa-sdk/core";
import {
  type Address,
  type Chain,
  concat,
  concatHex,
  hashMessage,
  hashTypedData,
  type Hex,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";

import { SignatureType } from "../modules/utils.js";
import {
  DEFAULT_OWNER_ENTITY_ID,
  pack1271Signature,
  packUOSignature,
} from "../utils.js";
/**
 * Creates an object with methods for generating a dummy signature, signing user operation hashes, signing messages, and signing typed data.
 *
 * @example
 * ```ts
 * import { nativeSMASigner } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 *
 * const MNEMONIC = "...":
 *
 * const account = createModularAccountV2({ config });
 *
 * const signer = LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);
 *
 * const messageSigner = nativeSMASigner(signer, chain, account.address);
 * ```
 *
 * @param {SmartAccountSigner} signer Signer to use for signing operations
 * @param {Chain} chain Chain object for the signer
 * @param {Address} accountAddress address of the smart account using this signer
 * @param {Hex} deferredActionData optional deferred action data to prepend to the uo signatures
 * @returns {object} an object with methods for signing operations and managing signatures
 */
export const nativeSMASigner = (
  signer: SmartAccountSigner,
  chain: Chain,
  accountAddress: Address,
  deferredActionData?: Hex,
) => {
  return {
    getDummySignature: (): Hex => {
      const sig = packUOSignature({
        // orderedHookData: [],
        validationSignature:
          "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      });

      return deferredActionData ? concatHex([deferredActionData, sig]) : sig;
    },

    signUserOperationHash: async (uoHash: Hex): Promise<Hex> => {
      let sig = await signer
        .signMessage({ raw: uoHash })
        .then((signature: Hex) =>
          packUOSignature({
            // orderedHookData: [],
            validationSignature: signature,
          }),
        );

      if (deferredActionData) {
        sig = concatHex([deferredActionData, sig]);
        deferredActionData = undefined;
      }

      return sig;
    },

    // we apply the expected 1271 packing here since the account contract will expect it
    async signMessage({ message }: { message: SignableMessage }): Promise<Hex> {
      const hash = hashMessage(message);

      return pack1271Signature({
        validationSignature: await signer.signTypedData({
          domain: {
            chainId: Number(chain.id),
            verifyingContract: accountAddress,
          },
          types: {
            ReplaySafeHash: [{ name: "hash", type: "bytes32" }],
          },
          message: {
            hash,
          },
          primaryType: "ReplaySafeHash",
        }),
        entityId: DEFAULT_OWNER_ENTITY_ID,
      });
    },

    // TODO: maybe move "sign deferred actions" to a separate function?
    // we don't apply the expected 1271 packing since deferred sigs use typed data sigs and don't expect the 1271 packing
    signTypedData: async <
      const typedData extends TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | "EIP712Domain" = keyof typedData,
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>,
    ): Promise<Hex> => {
      // the accounts domain already gives replay protection across accounts for deferred actions, so we don't need to apply another wrapping
      const isDeferredAction =
        typedDataDefinition.primaryType === "DeferredAction" &&
        typedDataDefinition.domain != null &&
        // @ts-expect-error the domain type I think changed in viem, so this is not working correctly (TODO: fix this)
        "verifyingContract" in typedDataDefinition.domain &&
        typedDataDefinition.domain.verifyingContract === accountAddress;

      return isDeferredAction
        ? concat([
            SignatureType.EOA,
            await signer.signTypedData(typedDataDefinition),
          ])
        : pack1271Signature({
            validationSignature: await signer.signTypedData({
              domain: {
                chainId: Number(chain.id),
                verifyingContract: accountAddress,
              },
              types: {
                ReplaySafeHash: [{ name: "hash", type: "bytes32" }],
              },
              message: {
                hash: await hashTypedData(typedDataDefinition),
              },
              primaryType: "ReplaySafeHash",
            }),
            entityId: DEFAULT_OWNER_ENTITY_ID,
          });
    },
  };
};
