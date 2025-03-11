import type { Address, SmartAccountClient } from "@aa-sdk/core";
import { encodePacked, type Hex, toHex } from "viem";

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

    const nonceOverride =
      (await args.client.account.getAccountNonce(args.nonceKeyOverride)) | 2n;

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
  buildDigest: async (args: {
    typedData: DeferredActionTypedData;
    nonce: bigint;
    sig: Hex;
  }) => {
    // nonce used to determine validation locator
    const validationLocator = ((args.nonce << 88n) >> 88n) & 0xffffffffffn;
    console.log("LOCATOR:", validationLocator.toString(16));
    console.log("LOCATOR:", toHex(validationLocator));

    let encodedData = encodePacked(
      ["uint168", "uint48", "bytes"],
      [
        validationLocator,
        args.typedData.message.deadline,
        args.typedData.message.call,
      ]
    );

    console.log("ENCODED DATA:", encodedData);
    console.log("ENCODED DATA LENGTH:", encodedData.length);
  },
};
