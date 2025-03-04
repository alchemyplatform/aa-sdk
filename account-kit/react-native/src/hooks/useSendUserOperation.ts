import type { GetEntryPointFromAccount } from "@aa-sdk/core";
import type { SupportedAccounts } from "@account-kit/core";
import {
  useSendUserOperation as useWebSendUserOperation,
  type UseSendUserOperationArgs,
  type UseSendUserOperationResult,
} from "@account-kit/react/hooks";

export const useSendUserOperation = <
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount>,
  TAccount extends SupportedAccounts = SupportedAccounts
>(
  params: UseSendUserOperationArgs<TEntryPointVersion, TAccount>
): UseSendUserOperationResult<TEntryPointVersion, TAccount> =>
  useWebSendUserOperation(params);
