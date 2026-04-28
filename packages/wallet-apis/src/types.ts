import type { WalletServerViemRpcSchema } from "@alchemy/wallet-api-types/rpc";
import type { SolanaChainId } from "@alchemy/wallet-api-types";
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
import type { SolanaSmartWalletActions } from "./decorators/solanaSmartWalletActions";

export type BaseWalletClient<
  TExtend extends { [key: string]: unknown } | undefined =
    | { [key: string]: unknown }
    | undefined,
  TAccount extends Account | undefined = JsonRpcAccount<Address>,
> = Client<
  Transport<"alchemyHttp">,
  Chain,
  TAccount,
  WalletServerViemRpcSchema,
  TExtend
>;

export type InnerWalletApiClient = BaseWalletClient<{
  internal: InternalState | undefined;
  owner: SmartWalletSigner;
  policyIds?: string[];
}>;

export type SignerClient = WalletClient<Transport, Chain | undefined, Account>;

export type SmartWalletSigner = LocalAccount | SignerClient;

export type SmartWalletClient = BaseWalletClient<SmartWalletActions>;

export interface SolanaChainDef extends Chain {
  solanaChainId: SolanaChainId;
}

/** Solana wallet standard signer (Privy, Phantom, etc). Takes serialized tx, returns signed serialized tx. */
export interface SolanaWalletStandardSigner {
  address: string;
  signTransaction(input: {
    transaction: Uint8Array;
    [key: string]: unknown;
  }): Promise<{ signedTransaction: Uint8Array }>;
}

/** @solana/kit TransactionPartialSigner. Takes Transaction objects, returns SignatureDictionaries. */
export interface SolanaTransactionPartialSigner {
  address: string;
  signTransactions(
    transactions: readonly unknown[],
  ): Promise<readonly Record<string, Uint8Array>[]>;
}

/** Raw Ed25519 keypair signer. Takes message bytes, returns 64-byte signature. */
export interface SolanaMessageSigner {
  address: string;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
}

export type SolanaSigner =
  | SolanaWalletStandardSigner
  | SolanaTransactionPartialSigner
  | SolanaMessageSigner;

export type InnerSolanaWalletApiClient = BaseWalletClient<
  {
    internal: InternalState | undefined;
    owner: SolanaSigner;
    solanaAccount: string;
    policyIds?: string[];
  },
  undefined
>;

export type SolanaSmartWalletClient = BaseWalletClient<
  SolanaSmartWalletActions & { solanaAccount: string },
  undefined
>;

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
