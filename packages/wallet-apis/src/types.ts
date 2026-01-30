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
import type { WebAuthnAccount } from "viem/account-abstraction";

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
  internal: InternalState | undefined; // undefined if you want to skip using an internal cache
  owner: SmartWalletSigner;
  policyIds?: string[];
}>;

export type SignerClient = WalletClient<Transport, Chain | undefined, Account>;

export type SmartWalletSigner = LocalAccount | WebAuthnAccount | SignerClient;

export type SmartWalletClient<
  TAccount extends Address | undefined = Address | undefined,
> = BaseWalletClient<SmartWalletActions<TAccount>>;

export type OptionalChainId<T> = T extends { chainId: Hex }
  ? Omit<T, "chainId"> & { chainId?: Hex | undefined }
  : T;

export type WithoutRawPayload<T> = T extends { rawPayload: Hex }
  ? Omit<T, "rawPayload">
  : T;

export type Expect<T extends true> = T;
