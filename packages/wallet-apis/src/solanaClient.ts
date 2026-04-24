import { BaseError } from "@alchemy/common";
import { createClient, defineChain, type Address } from "viem";
import { solanaSmartWalletActions } from "./decorators/solanaSmartWalletActions.js";
import type {
  InnerWalletApiClient,
  SolanaSmartWalletClient,
  SolanaSigner,
  SolanaChainDef,
} from "./types.js";
import { createInternalState } from "./internal.js";
import type { AlchemyWalletTransport } from "./transport.js";
import type { SolanaChainId } from "@alchemy/wallet-api-types";

// ── Internal Solana chain definitions ────────────────────────────────────────

const solanaMainnet: SolanaChainDef = {
  ...defineChain({
    id: 900_901,
    name: "Solana Mainnet",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    rpcUrls: { default: { http: [] } },
  }),
  solanaChainId: "solana-mainnet",
};

const solanaDevnet: SolanaChainDef = {
  ...defineChain({
    id: 900_903,
    name: "Solana Devnet",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    rpcUrls: { default: { http: [] } },
  }),
  solanaChainId: "solana-devnet",
};

const SOLANA_CHAINS: Record<string, SolanaChainDef> = {
  "solana-mainnet": solanaMainnet,
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": solanaMainnet,
  "solana-devnet": solanaDevnet,
  "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1": solanaDevnet,
};

// ── Factory ──────────────────────────────────────────────────────────────────

export type CreateSolanaSmartWalletClientParams = {
  signer: SolanaSigner;
  transport: AlchemyWalletTransport;
  chainId: SolanaChainId;
  account?: string;
  paymaster?: {
    policyId?: string;
    policyIds?: string[];
  };
};

export const createSolanaSmartWalletClient = ({
  signer,
  transport,
  chainId,
  account,
  paymaster,
}: CreateSolanaSmartWalletClientParams): SolanaSmartWalletClient => {
  const _policyIds = [
    ...(paymaster?.policyId ? [paymaster.policyId] : []),
    ...(paymaster?.policyIds ?? []),
  ];

  const _account = account ?? signer.address;

  const chain = SOLANA_CHAINS[chainId];
  if (!chain) {
    throw new BaseError(`Unsupported Solana chain ID: ${chainId}`);
  }

  return createClient({
    account: _account as Address,
    transport,
    chain,
    name: "alchemySolanaSmartWalletClient",
  })
    .extend(() => ({
      policyIds: _policyIds,
      internal: createInternalState(),
      owner: signer,
    }))
    .extend(
      solanaSmartWalletActions as (
        client: InnerWalletApiClient<"solana">,
      ) => ReturnType<typeof solanaSmartWalletActions>,
    ) as unknown as SolanaSmartWalletClient;
};
