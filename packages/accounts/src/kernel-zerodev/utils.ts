import { encodePacked, toBytes } from "viem";
import type { Hex } from "viem";
import type { KernelUserOperationCallData } from "./types";

export const encodeCall = (call: KernelUserOperationCallData): Hex => {
  const data = toBytes(call.data);
  return encodePacked(
    ["uint8", "address", "uint256", "uint256", "bytes"],
    [
      call.delegateCall ? 1 : 0,
      call.target,
      call.value ?? BigInt(0),
      BigInt(data.length),
      call.data,
    ]
  );
};
