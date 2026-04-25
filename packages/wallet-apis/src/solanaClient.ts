import { BaseError } from "@alchemy/common";
import { createClient, defineChain, type Address } from "viem";
import { solanaSmartWalletActions } from "./decorators/solanaSmartWalletActions.js";
import type {
  SolanaSmartWalletClient,
  SolanaSigner,
  SolanaChainDef,
} from "./types.js";
import { createInternalState } from "./internal.js";
import type { AlchemyWalletTransport } from "./transport.js";
import type { SolanaChainId } from "@alchemy/wallet-api-types";

const solanaMainnet: SolanaChainDef = {
  ...defineChain({
    id: 101,
    name: "Solana Mainnet",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    rpcUrls: { default: { http: [] } },
  }),
  solanaChainId: "solana-mainnet",
};

const solanaDevnet: SolanaChainDef = {
  ...defineChain({
    id: 103,
    name: "Solana Devnet",
    nativeCurrency: { name: "SOL", symbol: "SOL", decimals: 9 },
    rpcUrls: { default: { http: [] } },
  }),
  solanaChainId: "solana-devnet",
};

const SOLANA_CHAINS: Record<SolanaChainId, SolanaChainDef> = {
  "solana-mainnet": solanaMainnet,
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": solanaMainnet,
  "solana-devnet": solanaDevnet,
  "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1": solanaDevnet,
};

export type CreateSolanaSmartWalletClientParams = {
  signer: SolanaSigner;
  transport: AlchemyWalletTransport;
  chainId: SolanaChainId;
  account?: string;
  paymaster?: {
    policyId: string;
  };
};

export const createSolanaSmartWalletClient = ({
  signer,
  transport,
  chainId,
  account,
  paymaster,
}: CreateSolanaSmartWalletClientParams): SolanaSmartWalletClient => {
  const _policyIds = paymaster?.policyId ? [paymaster.policyId] : [];

  const _account = account ?? signer.address;

  const chain = SOLANA_CHAINS[chainId];
  if (!chain) {
    throw new BaseError(`Unsupported Solana chain ID: ${chainId}`);
  }

  return createClient({
    account: _account as Address, // TODO(jh): be sure viem doesn't freak out that this isn't hex
    transport,
    chain,
    name: "alchemySolanaSmartWalletClient",
  })
    .extend(() => ({
      policyIds: _policyIds,
      internal: createInternalState(),
      owner: signer,
    }))
    .extend(solanaSmartWalletActions);
};
