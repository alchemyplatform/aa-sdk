import type { Hex } from "viem";

type RundlerMaxPriorityFeePerGasSchema = {
  Method: "rundler_maxPriorityFeePerGas";
  Parameters: [];
  ReturnType: Hex;
};

export type RundlerRpcSchema = [RundlerMaxPriorityFeePerGasSchema];
