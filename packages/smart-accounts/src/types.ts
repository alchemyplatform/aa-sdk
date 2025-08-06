import type { IsUndefined, RpcUserOperation } from "viem";
import type { SmartAccount } from "viem/account-abstraction";

export type GetAccountParameter<
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
  TAccountOverride extends SmartAccount = SmartAccount,
> =
  IsUndefined<TAccount> extends true
    ? { account: TAccountOverride }
    : { account?: TAccountOverride };

// Minimal RPC schema that only declares the Alchemy priority fee method.
export type AlchemyRpcSchema = [
  {
    Method: "rundler_maxPriorityFeePerGas";
    Parameters: [];
    ReturnType: RpcUserOperation["maxPriorityFeePerGas"];
  },
];
