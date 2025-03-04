import {
  useWaitForUserOperationTransaction as useWebWaitForUserOperationTransaction,
  type UseWaitForUserOperationTransactionArgs,
  type UseWaitForUserOperationTransactionResult,
} from "@account-kit/react/hooks";

export const useWaitForUserOperationTransaction = (
  args: UseWaitForUserOperationTransactionArgs
): UseWaitForUserOperationTransactionResult =>
  useWebWaitForUserOperationTransaction(args);
