import type { Address, SmartAccountClient } from "@aa-sdk/core";
import { type Hex } from "viem";

type DeferredActionData = {
  typedData: {
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
  nonceOverride: bigint;
};

export const DeferredActionBuilder = {
  createTypedDataObject: async (args: {
    client: SmartAccountClient;
    calldata: Hex;
    deadline: number;
    entityId: number;
    isGlobalValidation: boolean;
    nonceKeyOverride?: bigint;
  }): Promise<DeferredActionData> => {
    if (!args.client.account) {
      throw "Account undefined in client";
    }

    // TODO: override the nonce
    const nonce =
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
          nonce: nonce,
          deadline: args.deadline,
          call: args.calldata,
        },
      },
      nonceOverride: nonce,
    };
  },
};
