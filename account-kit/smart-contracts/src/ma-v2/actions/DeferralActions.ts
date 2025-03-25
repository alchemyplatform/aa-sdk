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
  getContract,
  encodePacked,
  size,
  toHex,
} from "viem";
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
  nonceOverride: bigint;
};

export type CreateDeferredActionTypedDataParams = {
  callData: Hex;
  deadline: number;
  entityId: number;
  isGlobalValidation: boolean;
  nonceKeyOverride?: bigint;
};

export type BuildDeferredActionDigestParams = {
  typedData: DeferredActionTypedData;
  sig: Hex;
};

export type BuildUserOperationWithDeferredActionParams = {
  uo: UserOperationCallData | BatchUserOperationCallData;
  signaturePrepend: Hex;
  nonceOverride: bigint;
};

export type DeferralActions = {
  createDeferredActionTypedDataObject: (
    args: CreateDeferredActionTypedDataParams
  ) => Promise<DeferredActionReturnData>;
  buildDeferredActionDigest: (args: BuildDeferredActionDigestParams) => Hex;
  buildUserOperationWithDeferredAction: (
    args: BuildUserOperationWithDeferredActionParams
  ) => Promise<UserOperationRequest_v7>;
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
    entityId,
    isGlobalValidation,
    nonceKeyOverride,
  }: CreateDeferredActionTypedDataParams): Promise<DeferredActionReturnData> => {
    if (!client.account) {
      throw new AccountNotFoundError();
    }

    const baseNonceKey = nonceKeyOverride || 0n;
    if (baseNonceKey > maxUint152) {
      throw new InvalidNonceKeyError(baseNonceKey);
    }

    const entryPoint = client.account.getEntryPoint();
    if (entryPoint === undefined) {
      throw new EntryPointNotFoundError(client.chain, "0.7.0");
    }

    const entryPointContract = getContract({
      address: entryPoint.address,
      abi: entryPoint.abi,
      client: client,
    });

    // 2 = deferred action flags    0b10
    // 1 = isGlobal validation flag 0b01
    const fullNonceKey: bigint =
      ((baseNonceKey << 40n) + (BigInt(entityId) << 8n)) |
      2n |
      (isGlobalValidation ? 1n : 0n);

    const nonceOverride = (await entryPointContract.read.getNonce([
      client.account.address,
      fullNonceKey,
    ])) as bigint;

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
          nonce: nonceOverride,
          deadline: deadline,
          call: callData,
        },
      },
      nonceOverride: nonceOverride,
    };
  };

  /**
   * Creates the digest which must be prepended to the userOp signature.
   *
   * Assumption: The client this extends is used to sign the typed data.
   *
   * @param {object} args The argument object containing the following:
   * @param {DeferredActionTypedData} args.typedData The typed data object for the deferred action
   * @param {Hex} args.sig The signature to include in the digest
   * @returns {Hex} The encoded digest to be prepended to the userOp signature
   */
  const buildDeferredActionDigest = ({
    typedData,
    sig,
  }: BuildDeferredActionDigestParams): Hex => {
    const signerEntity = client.account.signerEntity;
    const validationLocator =
      (BigInt(signerEntity.entityId) << 8n) |
      (signerEntity.isGlobalValidation ? 1n : 0n);

    let encodedData = encodePacked(
      ["uint168", "uint48", "bytes"],
      [validationLocator, typedData.message.deadline, typedData.message.call]
    );

    const encodedDataLength = size(encodedData);
    const sigLength = size(sig);

    encodedData = concatHex([
      toHex(encodedDataLength, { size: 4 }),
      encodedData,
      toHex(sigLength, { size: 4 }),
      sig,
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

  return {
    createDeferredActionTypedDataObject,
    buildDeferredActionDigest,
    buildUserOperationWithDeferredAction,
  };
};
