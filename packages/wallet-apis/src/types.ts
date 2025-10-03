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
} from "viem";
import type { InternalState } from "./internal";
import type { SmartWalletClient1193Methods } from "./provider";
import type { SmartWalletActions } from "./decorators/smartWalletActions";

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

export type SignerClient = WalletClient<Transport, Chain | undefined, Account>;

export type SmartWalletClientEip1193Provider = Prettify<
  EIP1193Events & {
    request: EIP1193RequestFn<SmartWalletClient1193Methods>;
  }
>;

export type SmartWalletClient<
  TAccount extends Address | undefined = Address | undefined,
> = BaseWalletClient<SmartWalletActions<TAccount>>;

export type OptionalChainId<T> = T extends { chainId: Hex }
  ? Omit<T, "chainId"> & { chainId?: Hex | undefined }
  : T;

export type OptionalSignerAddress<T> = T extends { signerAddress: Address }
  ? Omit<T, "signerAddress"> & { signerAddress?: Address | undefined }
  : T;

export type WithoutRawPayload<T> = T extends { rawPayload: Hex }
  ? Omit<T, "rawPayload">
  : T;

export type Expect<T extends true> = T;
