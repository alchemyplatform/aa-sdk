import type { UserOperationCallData } from "@alchemy/aa-core";

export interface KernelUserOperationCallData extends UserOperationCallData {
  delegateCall?: boolean;
}

export type KernelBatchUserOperationCallData = KernelUserOperationCallData[];
