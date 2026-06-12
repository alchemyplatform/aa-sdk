import type { Chain } from "viem";
import { AlchemyError } from "../errors/AlchemyError.js";
import { ALCHEMY_RPC_MAPPING } from "../transport/chainRegistry.js";

/**
 * Known Alchemy network slugs for autocomplete.
 *
 * TODO(data-sdk): generate this union from daikon via the ws-tools CLI in the
 * same pass that generates ALCHEMY_RPC_MAPPING, so it is never hand-maintained.
 * This subset exists to prove the MVP only.
 */
export type KnownAlchemyNetwork =
  | "eth-mainnet"
  | "eth-sepolia"
  | "base-mainnet"
  | "base-sepolia"
  | "polygon-mainnet"
  | "polygon-amoy"
  | "arb-mainnet"
  | "arb-sepolia"
  | "opt-mainnet"
  | "opt-sepolia"
  | "solana-mainnet"
  | "solana-devnet";

/**
 * An Alchemy network identifier. Known slugs get autocomplete; arbitrary
 * strings are accepted as an escape hatch so new networks work without an
 * SDK release.
 */
export type AlchemyNetwork = KnownAlchemyNetwork | (string & {});

/**
 * Any accepted network input: a viem Chain, an Alchemy network slug
 * (e.g. "eth-mainnet"), or a CAIP-2 identifier (e.g. "eip155:1",
 * "solana:mainnet").
 */
export type NetworkInput = Chain | AlchemyNetwork;

/**
 * A resolved network: the Alchemy slug used for URL construction and REST
 * payloads, plus the numeric chain ID when one exists (EVM only).
 */
export type ResolvedNetwork = {
  slug: string;
  chainId?: number;
};

// Solana networks have no numeric chain ID; CAIP-2 aliases match the
// identifiers wallet-apis already uses.
const SOLANA_SLUG_BY_CAIP2: Record<string, string> = {
  "solana:mainnet": "solana-mainnet",
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": "solana-mainnet",
  "solana:devnet": "solana-devnet",
  "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1": "solana-devnet",
};

const SOLANA_SLUGS = new Set(Object.values(SOLANA_SLUG_BY_CAIP2));

const SLUG_PATTERN = /^[a-z0-9-]+$/;

// The slug is already present in every daikon-generated registry URL
// (https://{slug}.g.alchemy.com/v2); derive the slug<->chainId maps from it
// rather than maintaining a second copy. Once ws-tools emits structured
// entries ({ slug, chainId, caip2 }), these derivations go away.
const slugByChainId = new Map<number, string>();
const chainIdBySlug = new Map<string, number>();
for (const [chainId, url] of Object.entries(ALCHEMY_RPC_MAPPING)) {
  const slug = new URL(url).hostname.split(".")[0];
  if (slug) {
    slugByChainId.set(Number(chainId), slug);
    chainIdBySlug.set(slug, Number(chainId));
  }
}

/**
 * Resolves any accepted network input — viem Chain, Alchemy network slug, or
 * CAIP-2 identifier — to the Alchemy network slug (and chain ID when one
 * exists). All three forms resolve against the same daikon-generated registry.
 *
 * @example
 * ```ts
 * import { mainnet } from "viem/chains";
 * resolveNetwork(mainnet); // { slug: "eth-mainnet", chainId: 1 }
 * resolveNetwork("eth-mainnet"); // { slug: "eth-mainnet", chainId: 1 }
 * resolveNetwork("eip155:1"); // { slug: "eth-mainnet", chainId: 1 }
 * resolveNetwork("solana:mainnet"); // { slug: "solana-mainnet" }
 * ```
 *
 * @param {NetworkInput} input The network to resolve
 * @returns {ResolvedNetwork} The resolved slug and optional chain ID
 */
export function resolveNetwork(input: NetworkInput): ResolvedNetwork {
  if (typeof input === "object") {
    const slug = slugByChainId.get(input.id);
    if (!slug) {
      throw new AlchemyError(
        `Chain ${input.id} (${input.name}) is not in the Alchemy network registry. ` +
          `Pass an Alchemy network slug (e.g. "eth-mainnet") instead.`,
      );
    }
    return { slug, chainId: input.id };
  }

  if (input.startsWith("eip155:")) {
    const chainId = Number(input.slice("eip155:".length));
    const slug = slugByChainId.get(chainId);
    if (!Number.isInteger(chainId) || !slug) {
      throw new AlchemyError(
        `CAIP-2 identifier "${input}" is not in the Alchemy network registry.`,
      );
    }
    return { slug, chainId };
  }

  if (input.startsWith("solana:")) {
    const slug = SOLANA_SLUG_BY_CAIP2[input];
    if (!slug) {
      throw new AlchemyError(
        `CAIP-2 identifier "${input}" is not a known Solana network.`,
      );
    }
    return { slug };
  }

  if (!SLUG_PATTERN.test(input)) {
    throw new AlchemyError(
      `"${input}" is not a valid Alchemy network slug (expected lowercase letters, digits, and hyphens).`,
    );
  }

  // Known slugs resolve a chain ID; unknown slugs are the escape hatch for
  // networks newer than the shipped registry (URL is composed directly).
  if (SOLANA_SLUGS.has(input)) {
    return { slug: input };
  }
  return { slug: input, chainId: chainIdBySlug.get(input) };
}
