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
  LocalAccount,
} from "viem";
import type { InternalState } from "./internal";
import type { SmartWalletActions } from "./decorators/smartWalletActions";

export type BaseWalletClient<
  TExtend extends { [key: string]: unknown } | undefined =
    | { [key: string]: unknown }
    | undefined,
> = Client<
  Transport<"alchemyHttp">,
  Chain,
  JsonRpcAccount<Address>,
  WalletServerViemRpcSchema,
  TExtend
>;

export type InnerWalletApiClient = BaseWalletClient<{
  internal: InternalState | undefined; // undefined if you want to skip using an internal cache
  owner: SmartWalletSigner;
  policyIds?: string[];
}>;

export type SignerClient = WalletClient<Transport, Chain | undefined, Account>;

export type SmartWalletSigner = LocalAccount | SignerClient;

export type SmartWalletClient = BaseWalletClient<SmartWalletActions>;

export type OptionalChainId<T> = T extends { chainId: number }
  ? Omit<T, "chainId"> & { chainId?: number | undefined }
  : T;

export type OptionalFrom<T> = T extends { from: Address }
  ? Omit<T, "from"> & { from?: Address | undefined }
  : T;

export type WithoutRawPayload<T> = T extends { rawPayload: Hex }
  ? Omit<T, "rawPayload">
  : T;

export type Expect<T extends true> = T;

export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;
