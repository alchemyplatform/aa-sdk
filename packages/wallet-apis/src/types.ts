import type { WalletServerViemRpcSchema } from "@alchemy/wallet-api-types/rpc";
import type {
  Account,
  Address,
  Chain,
  Client,
  EIP1193Events,
  EIP1193RequestFn,
  Hex,
  JsonRpcAccount,
  Prettify,
  Transport,
  WalletClient,
  WalletRpcSchema,
} from "viem";
import type { InternalState } from "./internal";

export type ExtractRpcMethod<
  T extends readonly {
    Method: string;
    Parameters?: unknown;
    ReturnType: unknown;
  }[],
  M extends T[number]["Method"],
> = Extract<T[number], { Method: M }>;

export type SmartWalletClient1193Methods = [
  ExtractRpcMethod<WalletRpcSchema, "eth_chainId">,
  ExtractRpcMethod<WalletRpcSchema, "eth_accounts">,
  ExtractRpcMethod<WalletRpcSchema, "personal_sign">,
  ExtractRpcMethod<WalletRpcSchema, "eth_signTypedData_v4">,
  ExtractRpcMethod<WalletRpcSchema, "eth_sendTransaction">,
  ExtractRpcMethod<WalletRpcSchema, "wallet_sendCalls">,
  // TODO(jh): add this once wallet server supports it.
  // ExtractRpcMethod<WalletRpcSchema, "wallet_getCapabilities">,
];

export type SmartWalletClientEip1193Provider = Prettify<
  EIP1193Events & {
    request: EIP1193RequestFn<
      [...WalletServerViemRpcSchema, ...SmartWalletClient1193Methods]
    >;
  }
>;

export type BaseWalletClient<
  TExtend extends { [key: string]: unknown } | undefined =
    | { [key: string]: unknown }
    | undefined,
> = Client<
  Transport<"alchemy">,
  Chain,
  JsonRpcAccount<Address> | undefined,
  WalletServerViemRpcSchema,
  TExtend
>;

export type InnerWalletApiClient = BaseWalletClient<{
  internal: InternalState;
  policyIds?: string[];
}>;

export type SignerClient = WalletClient<Transport, Chain, Account>;

export type WithoutChainId<T> = T extends { chainId: Hex }
  ? Omit<T, "chainId">
  : T;

export type WithoutRawPayload<T> = T extends { rawPayload: Hex }
  ? Omit<T, "rawPayload">
  : T;

export type Expect<T extends true> = T;
