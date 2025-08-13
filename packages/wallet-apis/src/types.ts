import type { AlchemyTransport } from "@alchemy/common";
import type { WalletServerViemRpcSchema } from "@alchemy/wallet-api-types/rpc";
import type {
  Address,
  Chain,
  Client,
  Hex,
  JsonRpcAccount,
  LocalAccount,
} from "viem";
import type { InternalState } from "./internal";

export type BaseWalletClient<
  TExtend extends { [key: string]: unknown } | undefined =
    | { [key: string]: unknown }
    | undefined,
> = Client<
  AlchemyTransport,
  Chain,
  JsonRpcAccount<Address> | LocalAccount<Address>,
  WalletServerViemRpcSchema,
  TExtend
>;

export type InnerWalletApiClient = BaseWalletClient<{
  internal: InternalState;
  policyIds?: string[];
}>;

export type WithoutChainId<T> = T extends { chainId: Hex }
  ? Omit<T, "chainId">
  : T;

export type WithoutRawPayload<T> = T extends { rawPayload: Hex }
  ? Omit<T, "rawPayload">
  : T;

export type Expect<T extends true> = T;
