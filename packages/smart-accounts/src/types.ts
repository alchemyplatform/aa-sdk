import type { IsUndefined } from "viem";
import type { SmartAccount } from "viem/account-abstraction";

export type GetAccountParameter<
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
  TAccountOverride extends SmartAccount = SmartAccount,
> =
  IsUndefined<TAccount> extends true
    ? { account: TAccountOverride }
    : { account?: TAccountOverride };
