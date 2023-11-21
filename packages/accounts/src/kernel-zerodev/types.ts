import type { UserOperationCallData } from "@alchemy/aa-core";
import type { Hex } from "viem";

export type KernelUserOperationCallData = Exclude<
  UserOperationCallData,
  Hex
> & {
  delegateCall?: boolean;
};

export type KernelBatchUserOperationCallData = KernelUserOperationCallData[];
