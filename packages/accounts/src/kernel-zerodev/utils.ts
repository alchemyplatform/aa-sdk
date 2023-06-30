import { encodePacked, toBytes } from "viem";
import { KernelUserOperationCallData } from "./types";

export const encodeCall = (call: KernelUserOperationCallData): string => {
  const data = toBytes(call.data);
  const encoded = encodePacked(
    ["uint8", "address", "uint256", "uint256", "bytes"],
    [
      call.delegateCall ? 1 : 0,
      call.target,
      call.value || BigInt(0),
      data.length,
      call.data,
    ]
  );
  return encoded.slice(2);
};
