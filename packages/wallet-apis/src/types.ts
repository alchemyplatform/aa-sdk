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
} from "viem";
import type { InternalState } from "./internal";

export type BaseWalletClient<
  TExtend extends { [key: string]: unknown } | undefined =
    | { [key: string]: unknown }
    | undefined,
> = Client<
  Transport<"alchemyHttp">,
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

export type ExtractRpcMethod<
  T extends readonly {
    Method: string;
    Parameters?: unknown;
    ReturnType: unknown;
  }[],
  M extends T[number]["Method"],
> = Extract<T[number], { Method: M }>;
