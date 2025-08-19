import type { IsUndefined, SignableMessage, TypedDataDefinition } from "viem";
import type { SmartAccount } from "viem/account-abstraction";

export type GetAccountParameter<
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
  TAccountOverride extends SmartAccount = SmartAccount,
> =
  IsUndefined<TAccount> extends true
    ? { account: TAccountOverride }
    : { account?: TAccountOverride };

export type SignatureRequest =
  | {
      type: "personal_sign";
      data: SignableMessage;
    }
  | {
      type: "eth_signTypedData_v4";
      data: TypedDataDefinition;
    };
