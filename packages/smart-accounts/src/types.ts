import type {
  IsUndefined,
  SignableMessage,
  TypedDataDefinition,
  RpcUserOperation,
} from "viem";
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

// Minimal RPC schema that only declares the Alchemy priority fee method.
export type AlchemyRpcSchema = [
  {
    Method: "rundler_maxPriorityFeePerGas";
    Parameters: [];
    ReturnType: RpcUserOperation["maxPriorityFeePerGas"];
  },
];
