import { BaseError } from "@alchemy/common";
import {
  createClient,
  defineChain,
  type Address,
  type Chain,
} from "viem";
import { smartWalletActions } from "./decorators/smartWalletActions.js";
import { solanaSmartWalletActions } from "./decorators/solanaSmartWalletActions.js";
import type {
  SmartWalletClient,
  SmartWalletSigner,
  SolanaSmartWalletClient,
  SolanaSigner,
  SolanaChainDef,
} from "./types.js";
import { createInternalState } from "./internal.js";
import { isLocalAccount } from "./utils/assertions.js";
import type { AlchemyWalletTransport } from "./transport.js";
import type { SolanaChainId } from "@alchemy/wallet-api-types";

// ── Solana chain definitions ────────────────────────────────────────────

const solanaMainnet: SolanaChainDef = {
  ...defineChain({
    id: 0,
    name: "Solana Mainnet",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    rpcUrls: { default: { http: [] } },
  }),
  solanaChainId: "solana:mainnet",
};

const solanaDevnet: SolanaChainDef = {
  ...defineChain({
    id: 0,
    name: "Solana Devnet",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    rpcUrls: { default: { http: [] } },
  }),
  solanaChainId: "solana:devnet",
};

export const SOLANA_CHAINS: Record<SolanaChainId, SolanaChainDef> = {
  "solana:mainnet": solanaMainnet,
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": solanaMainnet,
  "solana:devnet": solanaDevnet,
  "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1": solanaDevnet,
};

// ── Param types ─────────────────────────────────────────────────────────

export type CreateEvmSmartWalletClientParams = {
  signer: SmartWalletSigner;
  transport: AlchemyWalletTransport;
  chain: Chain;
  account?: Address;
  paymaster?: {
    policyId?: string;
    policyIds?: string[];
  };
};

export type CreateSolanaSmartWalletClientParams = {
  signer: SolanaSigner;
  transport: AlchemyWalletTransport;
  chain: SolanaChainId;
  account?: string;
  paymaster?: {
    policyId: string;
  };
};

/** Either {@link CreateEvmSmartWalletClientParams} or {@link CreateSolanaSmartWalletClientParams}. */
export type CreateSmartWalletClientParams =
  | CreateEvmSmartWalletClientParams
  | CreateSolanaSmartWalletClientParams;

// ── Factory ─────────────────────────────────────────────────────────────

function isSolanaParams(
  params: CreateSmartWalletClientParams,
): params is CreateSolanaSmartWalletClientParams {
  return typeof params.chain === "string" && params.chain.startsWith("solana:");
}

/**
 * Creates a smart wallet client for EVM chains with actions for preparing,
 * signing, and sending user operations.
 *
 * @param {CreateEvmSmartWalletClientParams} params - EVM client configuration
 * @returns {SmartWalletClient} An EVM smart wallet client with smart wallet actions
 */
export function createSmartWalletClient(
  params: CreateEvmSmartWalletClientParams,
): SmartWalletClient;
/**
 * Creates a smart wallet client for Solana chains with actions for preparing,
 * signing, and sending transactions.
 *
 * Solana-specific adapters are in `@alchemy/wallet-apis/solana`.
 *
 * @param {CreateSolanaSmartWalletClientParams} params - Solana client configuration
 * @returns {SolanaSmartWalletClient} A Solana smart wallet client with Solana smart wallet actions
 */
export function createSmartWalletClient(
  params: CreateSolanaSmartWalletClientParams,
): SolanaSmartWalletClient;
export function createSmartWalletClient(
  params: CreateSmartWalletClientParams,
): SmartWalletClient | SolanaSmartWalletClient {
  if (isSolanaParams(params)) {
    return createSolanaClient(params);
  }
  return createEvmClient(params);
}

// ── EVM path ────────────────────────────────────────────────────────────

function createEvmClient({
  signer,
  transport,
  chain,
  account,
  paymaster,
}: CreateEvmSmartWalletClientParams): SmartWalletClient {
  const _policyIds = [
    ...(paymaster?.policyId ? [paymaster.policyId] : []),
    ...(paymaster?.policyIds ?? []),
  ];

  // If no account address is provided, the client defaults to using the signer's address via EIP-7702.
  const _account =
    account ??
    (isLocalAccount(signer) ? signer.address : signer.account.address);

  return createClient({
    account: _account,
    transport,
    chain,
    name: "alchemySmartWalletClient",
  })
    .extend(() => ({
      policyIds: _policyIds,
      internal: createInternalState(),
      owner: signer,
    }))
    .extend(smartWalletActions);
}

// ── Solana path ─────────────────────────────────────────────────────────

function createSolanaClient({
  signer,
  transport,
  chain,
  account,
  paymaster,
}: CreateSolanaSmartWalletClientParams): SolanaSmartWalletClient {
  const _policyIds = paymaster?.policyId ? [paymaster.policyId] : [];

  const _account = account ?? signer.address;

  const _chain = SOLANA_CHAINS[chain];
  if (!_chain) {
    throw new BaseError(`Unsupported Solana chain: ${chain}`);
  }

  return createClient({
    transport,
    chain: _chain,
    name: "alchemySolanaSmartWalletClient",
  })
    .extend(() => ({
      policyIds: _policyIds,
      internal: createInternalState(),
      owner: signer,
      solanaAccount: _account,
    }))
    .extend(solanaSmartWalletActions);
}
