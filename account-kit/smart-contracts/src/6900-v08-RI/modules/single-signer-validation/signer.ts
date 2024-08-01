import type { SmartAccountSigner } from "@aa-sdk/core";
import {
  hashMessage,
  hashTypedData,
  type Hex,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
  type Chain,
} from "viem";

import { packSignature, DEFAULT_OWNER_ENTITY_ID } from "../../utils.js";
import { meta } from "./module.js";

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
 * const signer = LocalAccountSigner.mnemonicToAccountSigner(MNEMONIC);
 *
 * const messageSigner = singleSignerMessageSigner(signer, chain);
 * ```
 *
 * @param {TSigner} signer the signer to use for signing operations
 * @param {Chain} chain the blockchain network chain
 * @returns {object} an object with methods for signing operations and managing signatures
 */
export const singleSignerMessageSigner = <TSigner extends SmartAccountSigner>(
  signer: TSigner,
  chain: Chain
) => {
  return {
    getDummySignature: (): Hex => {
      const dummyEcdsaSignature =
        "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";

      return packSignature({
        validationModule: meta.addresses[chain.id] ?? meta.addresses.default,
        entityID: DEFAULT_OWNER_ENTITY_ID,
        isGlobal: true, // todo: make this user-configurable
        orderedHookData: [],
        validationSignature: dummyEcdsaSignature,
      });
    },

    signUserOperationHash: (uoHash: `0x${string}`): Promise<`0x${string}`> => {
      return signer.signMessage({ raw: uoHash }).then((signature: Hex) =>
        packSignature({
          validationModule: meta.addresses[chain.id] ?? meta.addresses.default,
          entityID: DEFAULT_OWNER_ENTITY_ID,
          isGlobal: true, // todo: make this user-configurable
          orderedHookData: [],
          validationSignature: signature,
        })
      );
    },

    // TODO: we can't implement these methods yet, because the RI at `alpha.0` doesn't have a wrapping type,
    // and viem doesn't support raw signing, only via EIP-191 or EIP-712.
    // When we do implement this, we need to prefix the data with the validation module address & entityId.

    signMessage({
      message,
    }: {
      message: SignableMessage;
    }): Promise<`0x${string}`> {
      return signer.signMessage({ raw: hashMessage(message) });
    },

    signTypedData: <
      const typedData extends TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>
    ): Promise<Hex> => {
      return signer.signMessage({ raw: hashTypedData(typedDataDefinition) });
    },
  };
};
