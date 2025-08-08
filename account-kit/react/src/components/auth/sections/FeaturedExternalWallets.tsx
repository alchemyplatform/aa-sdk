import { useSolanaWallet } from "../../../hooks/useSolanaWallet.js";
import { useDeduplicatedConnectors } from "../../../hooks/internal/useWalletDeduplication.js";
import { WalletButton, SolanaWalletButton } from "../wallet-buttons/index.js";
import type { AuthType } from "../types.js";
import type { ChainType } from "../../../configForExternalWallets.js";

interface InlineWalletButtonsProps {
  config: Extract<AuthType, { type: "external_wallets" }>;
}

export const FeaturedExternalWallets = ({
  config,
}: InlineWalletButtonsProps) => {
  const { wallets } = useSolanaWallet();
  const connectors = useDeduplicatedConnectors();

  // Simplified: compute featured wallets from names and chainType
  const names = config.walletNames ?? [];
  const chains = (config.chainType ?? ["evm", "svm"]) as ChainType[];

  // EVM-first ordering within each name
  const chainOrder = (chains: ChainType[]) =>
    [...chains].sort((a, b) =>
      a === "evm" && b === "svm" ? -1 : a === "svm" && b === "evm" ? 1 : 0,
    );

  const featuredWallets = names.flatMap((name, idx) => {
    return chainOrder(chains).map((ct) => ({
      id: name,
      chain: ct,
      featured: idx,
    }));
  });

  const renderWalletButton = (
    walletConfig: { id: string; chain: ChainType; featured: number },
    index: number,
  ) => {
    if (walletConfig.chain === "svm") {
      // Find Solana wallet by adapter name (case-insensitive)
      const wallet = wallets.find(
        (w) => w.adapter.name.toLowerCase() === walletConfig.id.toLowerCase(),
      );
      return wallet ? <SolanaWalletButton key={index} wallet={wallet} /> : null;
    } else if (walletConfig.chain === "evm") {
      // Find EVM connector by type (deduplicated & reactive)
      const connector = connectors.find(
        (c) => c.type.toLowerCase() === walletConfig.id.toLowerCase(),
      );
      return connector ? (
        <WalletButton key={index} connector={connector} />
      ) : null;
    }
    return null;
  };

  return <>{featuredWallets.map(renderWalletButton)}</>;
};
