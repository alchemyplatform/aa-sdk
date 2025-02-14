import type { AccountConfig } from "../actions/createAccount";
import type { SupportedAccountModes, SupportedAccountTypes } from "../types";

export function parseMode<T extends SupportedAccountTypes>(
  accountParams: AccountConfig<T> | undefined
): SupportedAccountModes<T> {
  const modeParam =
    accountParams && "mode" in accountParams ? accountParams?.mode : undefined;
  return (modeParam ?? "default") as SupportedAccountModes<T>;
}
