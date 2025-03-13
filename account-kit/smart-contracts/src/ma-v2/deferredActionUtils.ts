import {
  InvalidNonceKeyError,
  type Address,
  type SmartAccountClient,
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
  /// Creates the typed data object ready for signing and the nonce for the given deferred action.
  /// Returns the typed data object and the nonce to override.
  createTypedDataObject: async (args: {
    client: SmartAccountClient;
    calldata: Hex;
    deadline: number;
    entityId: number;
    isGlobalValidation: boolean;
    nonceKeyOverride?: bigint;
  }): Promise<DeferredActionReturnData> => {
    if (!args.client.account) {
      throw "Account undefined in client";
    }

    const baseNonceKey = args.nonceKeyOverride || 0n;
    if (baseNonceKey > maxUint152) {
      throw new InvalidNonceKeyError(baseNonceKey);
    }

    if (args.client.account === undefined) {
      throw "temp";
    }

    const entryPoint = args.client.account.getEntryPoint();
    if (entryPoint === undefined) {
      throw "temp";
    }

    const entryPointContract = getContract({
      address: entryPoint.address,
      abi: entryPoint.abi,
      client: args.client,
    });

    const fullNonceKey: bigint =
      ((baseNonceKey << 40n) + (BigInt(args.entityId) << 8n)) | 3n; // 3 = isGlobal + deferred action flags

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
          call: args.calldata,
        },
      },
      nonceOverride: nonceOverride,
    };
  },
  // Maybe a better name for this
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
};
