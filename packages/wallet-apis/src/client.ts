import { BaseError } from "@alchemy/common";
import {
  createClient,
  defineChain,
  isAddress,
  type Address,
  type Chain,
} from "viem";
import { smartWalletActions } from "./decorators/smartWalletActions.js";
import { solanaSmartWalletActions } from "./decorators/solanaSmartWalletActions.js";
import type {
  SmartWalletClient,
  SmartWalletSigner,
  SolanaSmartWalletClient,
  SolanaStandardSigner,
  SolanaChainDef,
} from "./types.js";
import { createInternalState } from "./internal.js";
import { isLocalAccount } from "./utils/assertions.js";
import type { AlchemyWalletTransport } from "./transport.js";
import type { SolanaChainId } from "@alchemy/wallet-api-types";

// ── Solana chain definitions ────────────────────────────────────────────

const solanaMainnet: SolanaChainDef = {
  ...defineChain({
    id: 101,
    name: "Solana Mainnet",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    rpcUrls: { default: { http: [] } },
  }),
  solanaChainId: "solana:mainnet",
};

const solanaDevnet: SolanaChainDef = {
  ...defineChain({
    id: 103,
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

// ── Validation ──────────────────────────────────────────────────────────

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function validateEvmAddress(address: string): asserts address is Address {
  if (!isAddress(address)) {
    throw new BaseError(`Invalid EVM address: ${address}`);
  }
}

function validateSolanaAddress(address: string): void {
  if (!BASE58_RE.test(address)) {
    throw new BaseError(`Invalid Solana address: ${address}`);
  }
}

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
  signer: SolanaStandardSigner;
  transport: AlchemyWalletTransport;
  chain: SolanaChainId;
  account?: string;
  paymaster?: {
    policyId: string;
  };
};

export type CreateSmartWalletClientParams =
  | CreateEvmSmartWalletClientParams
  | CreateSolanaSmartWalletClientParams;

// ── Factory ─────────────────────────────────────────────────────────────

function isSolanaParams(
  params: CreateSmartWalletClientParams,
): params is CreateSolanaSmartWalletClientParams {
  return typeof params.chain === "string" && params.chain.startsWith("solana:");
}

export function createSmartWalletClient(
  params: CreateEvmSmartWalletClientParams,
): SmartWalletClient;
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

  const _account =
    account ??
    (isLocalAccount(signer) ? signer.address : signer.account.address);

  if (account) {
    validateEvmAddress(account);
  }

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

  if (account) {
    validateSolanaAddress(account);
  }

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
