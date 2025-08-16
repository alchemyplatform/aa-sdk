import type { WalletServerViemRpcSchema } from "@alchemy/wallet-api-types/rpc";
import type {
  Account,
  Address,
  Chain,
  Client,
  Hex,
  JsonRpcAccount,
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

type SmartWalletClient1193Methods = [
  ExtractRpcMethod<WalletRpcSchema, "eth_chainId">,
  ExtractRpcMethod<WalletRpcSchema, "eth_accounts">,
  ExtractRpcMethod<WalletRpcSchema, "personal_sign">,
  ExtractRpcMethod<WalletRpcSchema, "eth_signTypedData_v4">,
  ExtractRpcMethod<WalletRpcSchema, "wallet_sendCalls">,
  ExtractRpcMethod<WalletRpcSchema, "wallet_getCapabilities">,
];

export type SmartWalletClientRpcSchema = [
  ...WalletServerViemRpcSchema,
  ...SmartWalletClient1193Methods,
];

export type BaseWalletClient<
  TExtend extends { [key: string]: unknown } | undefined =
    | { [key: string]: unknown }
    | undefined,
> = Client<
  Transport<"alchemy">,
  Chain,
  JsonRpcAccount<Address> | undefined,
  SmartWalletClientRpcSchema,
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
