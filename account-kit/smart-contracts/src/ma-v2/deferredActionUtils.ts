import type { Address, SmartAccountClient } from "@aa-sdk/core";
import { concatHex, encodePacked, type Hex, size, toHex } from "viem";

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
    // First, get the normal nonce, which should be the standard fallback validation + 1 for global validation
    // Then, toggle the flag for "deferred action" (2 << 64)
    const nonceOverride =
      (await args.client.account.getAccountNonce(args.nonceKeyOverride)) |
      (2n << 64n);

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

    console.log("ENCODED DATA:", encodedData);
    console.log("ENCODED DATA LENGTH:", encodedDataLength);
    console.log("\n\nSIG:\n\n", args.sig);
    console.log("\n\nSIG LENGTH:\n\n", sigLength);

    encodedData = concatHex([
      toHex(encodedDataLength, { size: 4 }),
      encodedData,
      toHex(sigLength, { size: 4 }),
      args.sig,
    ]);

    return encodedData;
  },
};

// 0x0000013f // Encoded data length (319 bytes)
// 000000000000000000000000000000000000000001 // Validation locator (fallback + isGlobal)
// 000000000000 // deadline
// 1bbf564c // installValidation selector
// 00000000000099DE0BF6fA90dEB851E2A2df7d83000000010700000000000000 // abi-encoded validation config
// 0000000000000000000000000000000000000000000000000000000000000080 // Offset of bytes4[] selectors
// 00000000000000000000000000000000000000000000000000000000000000a0 // Offset of bytes installData
// 0000000000000000000000000000000000000000000000000000000000000100 // Offset of bytes[] hooks
// 0000000000000000000000000000000000000000000000000000000000000000 // Length of bytes4[] selectors (0)
// 0000000000000000000000000000000000000000000000000000000000000040 // Length of bytes installData (40)
// 0000000000000000000000000000000000000000000000000000000000000001 // InstallData word 1
// 0000000000000000000000008391de4cacfb91f1cf953cf345948d92e137b6b9 // InstallData word 2
// 0000000000000000000000000000000000000000000000000000000000000000 // Length of bytes4[] hooks (0)

// sig:
// 00000041 Sig length (65)
// a298f66ce1ea79d426a0174efc0e4a4f31f9c51598d0adcfd679ca896a853aab22b32d2c5c8b57ddb5a8da4b2eaba452bb636998e096dc70fef3e4e768d753af1c // Deferred action sig
// FF005ee15838521cdbba6d691c6b62cc07e6c2bf4b4ddc86d993ccc78fdf41d3e4677ed504d78ed8ed62fe15ef5fa6fa2dd58c1fa67ea8d8135a856c7b6af79de6a71b // UO sig
