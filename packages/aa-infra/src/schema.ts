import type { Hex } from "viem";

type RundlerMaxPriorityFeePerGasSchema = {
  Method: "rundler_maxPriorityFeePerGas";
  Parameters: [];
  ReturnType: Hex;
};

type RundlerGetUserOperationGasPriceSchema = {
  Method: "rundler_getUserOperationGasPrice";
  Parameters: [];
  ReturnType: {
    priorityFee: Hex;
    baseFee: Hex;
    blockNumber: Hex;
    suggested: {
      maxPriorityFeePerGas: Hex;
      maxFeePerGas: Hex;
    };
  };
};

export type RundlerRpcSchema = [
  RundlerMaxPriorityFeePerGasSchema,
  RundlerGetUserOperationGasPriceSchema,
];
