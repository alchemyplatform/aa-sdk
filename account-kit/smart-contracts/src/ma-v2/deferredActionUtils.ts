import {
  AccountNotFoundError,
  EntryPointNotFoundError,
  InvalidNonceKeyError,
  type Address,
  type BatchUserOperationCallData,
  type UserOperationCallData,
  type UserOperationRequest_v7,
} from "@aa-sdk/core";
import {
  concatHex,
  encodePacked,
  getContract,
  type Hex,
  maxUint152,
  size,
  toHex,
} from "viem";
import type { ModularAccountV2Client } from "./client/client";

type DeferredActionTypedData = {
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

type DeferredActionReturnData = {
  typedData: DeferredActionTypedData;
  nonceOverride: bigint;
};

export const DeferredActionBuilder = {
  /**
   * Creates the typed data object ready for signing and the nonce for the given deferred action.
   *
   * @param {object} args The argument object containing the following:
   * @param {ModularAccountV2Client} args.client A client associated with the sender account, only needed to access the account address and entrypoint
   * @param {Hex} args.callData The call data to defer
   * @param {number} args.deadline The deadline to include in this typed data, or zero for no deadline
   * @param {number} args.entityId The entityId to use with the entire userOp, generally this will be the entity ID of the session key being installed in the deferred action, used to build the nonce
   * @param {boolean} args.isGlobalValidation Whether the validation to use with the entire userOp is global
   * @param {bigint} args.nonceKeyOverride The nonce key override for the entire UserOp if needed
   * @returns {Promise<DeferredActionReturnData>} Object containing the typed data object and nonce override for the deferred action.
   */
  createTypedDataObject: async (args: {
    client: ModularAccountV2Client;
    callData: Hex;
    deadline: number;
    entityId: number;
    isGlobalValidation: boolean;
    nonceKeyOverride?: bigint;
  }): Promise<DeferredActionReturnData> => {
    if (!args.client.account) {
      throw new AccountNotFoundError();
    }

    const baseNonceKey = args.nonceKeyOverride || 0n;
    if (baseNonceKey > maxUint152) {
      throw new InvalidNonceKeyError(baseNonceKey);
    }

    const entryPoint = args.client.account.getEntryPoint();
    if (entryPoint === undefined) {
      throw new EntryPointNotFoundError(args.client.chain, "0.7.0");
    }

    const entryPointContract = getContract({
      address: entryPoint.address,
      abi: entryPoint.abi,
      client: args.client,
    });

    // 2 = deferred action flags    0b10
    // 1 = isGlobal validation flag 0b01
    const fullNonceKey: bigint =
      ((baseNonceKey << 40n) + (BigInt(args.entityId) << 8n)) |
      2n |
      (args.isGlobalValidation ? 1n : 0n);

    const nonceOverride = (await entryPointContract.read.getNonce([
      args.client.account.address,
      fullNonceKey,
    ])) as bigint;

    return {
      typedData: {
        domain: {
          chainId: await args.client.getChainId(),
          verifyingContract: args.client.account.address,
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
          deadline: args.deadline,
          call: args.callData,
        },
      },
      nonceOverride: nonceOverride,
    };
  },

  /**
   * Creates the digest which must be prepended to the userOp signature.
   *
   * @param {object} args The argument object containing the following:
   * @param {DeferredActionTypedData} args.typedData The typed data object for the deferred action
   * @param {bigint} args.nonce The nonce to use for the entire UserOp
   * @param {Hex} args.sig The signature to include in the digest
   * @returns {Hex} The encoded digest to be prepended to the userOp signature
   */
  buildDigest: (args: {
    typedData: DeferredActionTypedData;
    nonce: bigint;
    sig: Hex;
  }): Hex => {
    // nonce used to determine validation locator
    const validationLocator = 1n; // fallback validation with isGlobal set to true

    let encodedData = encodePacked(
      ["uint168", "uint48", "bytes"],
      [
        validationLocator,
        args.typedData.message.deadline,
        args.typedData.message.call,
      ]
    );

    const encodedDataLength = size(encodedData);

    const sigLength = size(args.sig);

    encodedData = concatHex([
      toHex(encodedDataLength, { size: 4 }),
      encodedData,
      toHex(sigLength, { size: 4 }),
      args.sig,
    ]);

    return encodedData;
  },

  /**
   * Builds a user operation with a deferred action by wrapping buildUserOperation() with a dummy signature override.
   *
   * @param {object} args The argument object containing the following:
   * @param {ModularAccountV2Client} args.client A client associated with the sender account
   * @param {UserOperationCallData | BatchUserOperationCallData} args.uo The user operation call data to build
   * @param {Hex} args.signaturePrepend The signature data to prepend to the dummy signature
   * @param {bigint} args.nonceOverride The nonce to override in the user operation
   * @returns {Promise<UserOperationRequest_v7>} The unsigned user operation request with the deferred action
   * @throws {string} If client.account is undefined
   */
  buildUserOperationWithDeferredAction: async (args: {
    client: ModularAccountV2Client;
    uo: UserOperationCallData | BatchUserOperationCallData;
    signaturePrepend: Hex;
    nonceOverride: bigint;
  }): Promise<UserOperationRequest_v7> => {
    // Pre-fetch the dummy sig so we can override `provider.account.getDummySignature()`
    if (args.client.account === undefined) {
      throw new AccountNotFoundError();
    }

    // Pre-fetch the dummy sig so we can override `provider.account.getDummySignature()`
    const dummySig = await args.client.account.getDummySignature();

    // Cache the previous dummy signature getter
    const previousDummySigGetter = args.client.account.getDummySignature;

    // Override provider.account.getDummySignature() so `provider.buildUserOperation()` uses the prepended hex and the dummy signature during gas estimation
    args.client.account.getDummySignature = () => {
      return concatHex([args.signaturePrepend, dummySig as Hex]);
    };

    const unsignedUo = (await args.client.buildUserOperation({
      uo: args.uo,
      overrides: {
        nonce: args.nonceOverride,
      },
    })) as UserOperationRequest_v7;

    // Restore the dummy signature getter
    args.client.getDummySignature = previousDummySigGetter;

    return unsignedUo;
  },
};
