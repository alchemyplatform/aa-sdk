import {
  AccountNotFoundError,
  InvalidNonceKeyError,
  EntryPointNotFoundError,
  type UserOperationCallData,
  type BatchUserOperationCallData,
  type UserOperationRequest_v7,
} from "@aa-sdk/core";
import {
  type Address,
  type Hex,
  concatHex,
  maxUint152,
  encodePacked,
  size,
  toHex,
  encodeDeployData,
  hexToNumber,
} from "viem";
import { entityIdAndNonceReaderBytecode, buildFullNonceKey } from "../utils.js";
import { entityIdAndNonceReaderAbi } from "../abis/entityIdAndNonceReader.js";
import type { ModularAccountV2Client } from "../client/client.js";

export type DeferredActionTypedData = {
  domain: {
    chainId: number;
    verifyingContract: Address;
  };
  types: {
    DeferredAction: [
      { name: "nonce"; type: "uint256" },
      { name: "deadline"; type: "uint48" },
      { name: "call"; type: "bytes" }
    ];
  };
  primaryType: "DeferredAction";
  message: {
    nonce: bigint;
    deadline: number;
    call: Hex;
  };
};

export type DeferredActionReturnData = {
  typedData: DeferredActionTypedData;
};

export type CreateDeferredActionTypedDataParams = {
  callData: Hex;
  deadline: number;
  nonce: bigint;
};

export type BuildDeferredActionDigestParams = {
  fullPreSignatureDeferredActionDigest: Hex;
  sig: Hex;
};

export type BuildPreSignatureDeferredActionDigestParams = {
  typedData: DeferredActionTypedData;
};

export type BuildUserOperationWithDeferredActionParams = {
  uo: UserOperationCallData | BatchUserOperationCallData;
  signaturePrepend: Hex;
  nonceOverride: bigint;
};

export type EntityIdAndNonceParams = {
  entityId?: number;
  nonceKey?: bigint;
  isGlobalValidation: boolean;
  isDeferredAction?: boolean;
};

export type DeferralActions = {
  createDeferredActionTypedDataObject: (
    args: CreateDeferredActionTypedDataParams
  ) => Promise<DeferredActionReturnData>;
  buildDeferredActionDigest: (args: BuildDeferredActionDigestParams) => Hex;
  buildPreSignatureDeferredActionDigest: (
    args: BuildPreSignatureDeferredActionDigestParams
  ) => Hex;
  buildUserOperationWithDeferredAction: (
    args: BuildUserOperationWithDeferredActionParams
  ) => Promise<UserOperationRequest_v7>;
  getEntityIdAndNonce: (
    args: EntityIdAndNonceParams
  ) => Promise<{ nonce: bigint; entityId: number }>;
};

/**
 * Provides deferred action functionalities for a MA v2 client, ensuring compatibility with `SmartAccountClient`.
 *
 * @param {ModularAccountV2Client} client - The client instance which provides account and sendUserOperation functionality.
 * @returns {object} - An object containing three methods: `createDeferredActionTypedDataObject`, `buildDeferredActionDigest`, and `buildUserOperationWithDeferredAction`.
 */
export const deferralActions: (
  client: ModularAccountV2Client
) => DeferralActions = (client: ModularAccountV2Client): DeferralActions => {
  const createDeferredActionTypedDataObject = async ({
    callData,
    deadline,
    nonce,
  }: CreateDeferredActionTypedDataParams): Promise<DeferredActionReturnData> => {
    if (!client.account) {
      throw new AccountNotFoundError();
    }

    const entryPoint = client.account.getEntryPoint();
    if (entryPoint === undefined) {
      throw new EntryPointNotFoundError(client.chain, "0.7.0");
    }

    return {
      typedData: {
        domain: {
          chainId: await client.getChainId(),
          verifyingContract: client.account.address,
        },
        types: {
          DeferredAction: [
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint48" },
            { name: "call", type: "bytes" },
          ],
        },
        primaryType: "DeferredAction",
        message: {
          nonce: nonce,
          deadline: deadline,
          call: callData,
        },
      },
    };
  };

  /**
   * Creates the digest which must be prepended to the userOp signature.
   *
   * Assumption: The client this extends is used to sign the typed data.
   *
   * @param {object} args The argument object containing the following:
   * @param {Hex} args.fullPreSignatureDeferredActionDigest The The data to append the signature and length to
   * @param {Hex} args.sig The signature to include in the digest
   * @returns {Hex} The encoded digest to be prepended to the userOp signature
   */
  const buildDeferredActionDigest = ({
    fullPreSignatureDeferredActionDigest,
    sig,
  }: BuildDeferredActionDigestParams): Hex => {
    const sigLength = size(sig);

    const encodedData = concatHex([
      fullPreSignatureDeferredActionDigest,
      toHex(sigLength, { size: 4 }),
      sig,
    ]);
    return encodedData;
  };

  const buildPreSignatureDeferredActionDigest = ({
    typedData,
  }: BuildPreSignatureDeferredActionDigestParams): Hex => {
    const signerEntity = client.account.signerEntity;
    const validationLocator =
      (BigInt(signerEntity.entityId) << 8n) |
      (signerEntity.isGlobalValidation ? 1n : 0n);

    const encodedCallData = encodePacked(
      ["uint168", "uint48", "bytes"],
      [validationLocator, typedData.message.deadline, typedData.message.call]
    );

    const encodedDataLength = size(encodedCallData);
    const encodedData = concatHex([
      toHex(encodedDataLength, { size: 4 }),
      encodedCallData,
    ]);
    return encodedData;
  };

  /**
   * Builds a user operation with a deferred action by wrapping buildUserOperation() with a dummy signature override.
   *
   * @param {object} args The argument object containing the following:
   * @param {UserOperationCallData | BatchUserOperationCallData} args.uo The user operation call data to build
   * @param {Hex} args.signaturePrepend The signature data to prepend to the dummy signature
   * @param {bigint} args.nonceOverride The nonce to override in the user operation, generally given from the typed data builder
   * @returns {Promise<UserOperationRequest_v7>} The unsigned user operation request with the deferred action
   */
  const buildUserOperationWithDeferredAction = async ({
    uo,
    signaturePrepend,
    nonceOverride,
  }: BuildUserOperationWithDeferredActionParams): Promise<UserOperationRequest_v7> => {
    // Check if client.account is defined
    if (client.account === undefined) {
      throw new AccountNotFoundError();
    }

    // Pre-fetch the dummy sig so we can override `client.account.getDummySignature()`
    const dummySig = await client.account.getDummySignature();

    // Cache the previous dummy signature getter
    const previousDummySigGetter = client.account.getDummySignature;

    // Override client.account.getDummySignature() so `client.buildUserOperation()` uses the prepended hex and the dummy signature during gas estimation
    client.account.getDummySignature = () => {
      return concatHex([signaturePrepend, dummySig as Hex]);
    };

    const unsignedUo = (await client.buildUserOperation({
      uo: uo,
      overrides: {
        nonce: nonceOverride,
      },
    })) as UserOperationRequest_v7;

    // Restore the dummy signature getter
    client.account.getDummySignature = previousDummySigGetter;

    return unsignedUo;
  };

  const getEntityIdAndNonce = async ({
    entityId = 1,
    nonceKey = 0n,
    isGlobalValidation,
    isDeferredAction = true,
  }: EntityIdAndNonceParams) => {
    if (!client.account) {
      throw new AccountNotFoundError();
    }

    if (nonceKey > maxUint152) {
      throw new InvalidNonceKeyError(nonceKey);
    }

    const entryPoint = client.account.getEntryPoint();
    if (entryPoint === undefined) {
      throw new EntryPointNotFoundError(client.chain, "0.7.0");
    }

    const bytecode = encodeDeployData({
      abi: entityIdAndNonceReaderAbi,
      bytecode: entityIdAndNonceReaderBytecode,
      args: [
        client.account.address,
        entryPoint.address,
        buildFullNonceKey({
          nonceKey,
          entityId,
          isGlobalValidation,
          isDeferredAction,
        }),
      ],
    });

    const { data } = await client.call({ data: bytecode });
    if (!data) {
      throw new Error("No data returned from contract call");
    }

    return {
      nonce: BigInt(data),
      entityId: hexToNumber(`0x${data.slice(40, 48)}`),
    };
  };

  return {
    createDeferredActionTypedDataObject,
    buildDeferredActionDigest,
    buildPreSignatureDeferredActionDigest,
    buildUserOperationWithDeferredAction,
    getEntityIdAndNonce,
  };
};
