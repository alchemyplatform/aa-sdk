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
  encodeAbiParameters,
} from "viem";
import { type ToWebAuthnAccountParameters } from "viem/account-abstraction";
import { getDefaultWebauthnValidationModuleAddress } from "../utils.js";
import * as WebAuthnP256 from "ox/WebAuthnP256";
import { pack1271Signature } from "../../utils.js";

/**
 * Creates an object with methods for generating a dummy signature, signing user operation hashes, signing messages, and signing typed data.
 *
 * @example 
 
 * ```ts
 * import { webauthnSigningFunctions } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 *
 * const messageSigner = webauthnSigningFunctions(params, chain, account.address, account.signerEntity.entityId);
 * ```
 *
 * @param {ToWebAuthnAccountParameters} params Parameters for creating a webauthn account}
 * @param {Chain} chain Chain object for the signer
 * @param {Address} accountAddress address of the smart account using this signer
 * @param {number} entityId the entity id of the signing validation
 * @param {Hex} deferredActionData optional deferred action data to prepend to the uo signatures
 * @returns {object} an object with methods for signing operations and managing signatures
 */
export const webauthnSigningFunctions = (
  params: ToWebAuthnAccountParameters,
  chain: Chain,
  accountAddress: Address,
  entityId: number,
  deferredActionData?: Hex
) => {
  const { getFn, rpId } = params;
  const { id, publicKey } = params.credential;

  const sign = async ({ hash }: { hash: Hex }) => {
    const { metadata, signature } = await WebAuthnP256.sign({
      credentialId: id,
      getFn,
      challenge: hash,
      rpId,
    });

    return encodeAbiParameters(
      [
        { name: "authenticatorData", type: "bytes" },
        { name: "clientDataJSON", type: "string" },
        { name: "challengeIndex", type: "uint256" },
        { name: "typeIndex", type: "uint256" },
        { name: "r", type: "uint256" },
        { name: "s", type: "uint256" },
      ],
      [
        metadata.authenticatorData,
        metadata.clientDataJSON,
        BigInt(metadata.challengeIndex),
        BigInt(metadata.typeIndex),
        signature.r,
        signature.s,
      ]
    );
  };

  return {
    id,
    publicKey,
    // TODO: dummy sig format
    getDummySignature: (): Hex =>
      "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    sign,
    signUserOperationHash: async (uoHash: Hex): Promise<Hex> => {
      let sig = await sign({ hash: hashMessage(uoHash) });
      if (deferredActionData) {
        sig = concatHex([deferredActionData, sig]);
        deferredActionData = undefined;
      }

      return sig;
    },

    async signMessage({ message }: { message: SignableMessage }): Promise<Hex> {
      const hash = hashTypedData({
        domain: {
          chainId: Number(chain.id),
          verifyingContract: getDefaultWebauthnValidationModuleAddress(chain),
          salt: concatHex([`0x${"00".repeat(12)}`, accountAddress]),
        },
        types: {
          ReplaySafeHash: [{ name: "hash", type: "bytes32" }],
        },
        message: {
          hash: hashMessage(message),
        },
        primaryType: "ReplaySafeHash",
      });

      return pack1271Signature({
        validationSignature: await sign({ hash }),
        entityId,
      });
    },

    signTypedData: async <
      const typedData extends TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>
    ): Promise<Hex> => {
      const isDeferredAction =
        typedDataDefinition?.primaryType === "DeferredAction" &&
        typedDataDefinition?.domain?.verifyingContract === accountAddress;

      const hash = await hashTypedData({
        domain: {
          chainId: Number(chain.id),
          verifyingContract: getDefaultWebauthnValidationModuleAddress(chain),
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

      const validationSignature = await sign({ hash });

      return isDeferredAction
        ? pack1271Signature({ validationSignature, entityId })
        : validationSignature;
    },
  };
};
