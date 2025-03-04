import type { GetEntryPointFromAccount } from "@aa-sdk/core";
import type { SupportedAccounts } from "@account-kit/core";
import {
  useDropAndReplaceUserOperation as useWebDropAndReplaceUserOperation,
  type UseDropAndReplaceUserOperationArgs,
  type UseDropAndReplaceUserOperationResult,
} from "@account-kit/react/hooks";

export const useDropAndReplaceUserOperation = <
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
>(
  args: UseDropAndReplaceUserOperationArgs<TEntryPointVersion, TAccount>
): UseDropAndReplaceUserOperationResult<TEntryPointVersion, TAccount> =>
  useWebDropAndReplaceUserOperation(args);
