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

    return concatHex([
      "0x0000000000000000000000000000000000000000000000000000000000000020",
      encodeAbiParameters(
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
      ),
    ]);
  };

  return {
    id,
    publicKey,
    getDummySignature: (): Hex =>
      "0xff000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000",
    sign,
    signUserOperationHash: async (uoHash: Hex): Promise<Hex> => {
      let sig = await sign({ hash: hashMessage(uoHash) });
      if (deferredActionData) {
        sig = concatHex([deferredActionData, sig]);
        deferredActionData = undefined;
      }

      return concatHex(["0xff", sig]);
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
