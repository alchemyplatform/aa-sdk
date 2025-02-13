import type { CreateModularAccountV2Params } from "@account-kit/smart-contracts";
import type { AccountConfig } from "../actions/createAccount";
import type { SupportedAccountModes, SupportedAccountTypes } from "../types";

export function parseMode<T extends SupportedAccountTypes>(
  type: T,
  accountParams: AccountConfig<T> | undefined
) {
  if (type !== "ModularAccountV2") {
    return "default";
  }
  return ((accountParams as CreateModularAccountV2Params | undefined)?.mode ??
    "default") as SupportedAccountModes<"ModularAccountV2">;
}
