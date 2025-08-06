import { useSolanaWallet } from "../../../hooks/useSolanaWallet.js";
import { useConnectEOA } from "../hooks/useConnectEOA.js";
import { useWalletConnectAuthConfig } from "../hooks/useWalletConnectAuthConfig.js";
import {
  WalletButton,
  WalletConnectButton,
  SolanaWalletButton,
} from "../wallet-buttons/index.js";
import type { AuthType } from "../types.js";
import type { ExternalWalletUIConfig } from "../../../configForExternalWallets.js";

interface InlineWalletButtonsProps {
  config: Extract<AuthType, { type: "external_wallets" }>;
}

export const FeaturedExternalWallets = ({
  config,
}: InlineWalletButtonsProps) => {
  const { connectors } = useConnectEOA();
  const { wallets } = useSolanaWallet();
  const { walletConnectParams } = useWalletConnectAuthConfig();

  // Get featured wallets from the new config structure
  const featuredWallets =
    config.wallets
      ?.filter(
        (wallet: ExternalWalletUIConfig) => typeof wallet.featured === "number",
      )
      .sort(
        (a: ExternalWalletUIConfig, b: ExternalWalletUIConfig) =>
          a.featured! - b.featured!,
      ) || [];

  const renderWalletButton = (
    walletConfig: ExternalWalletUIConfig,
    index: number,
  ) => {
    if (walletConfig.type === "solana") {
      // Find Solana wallet by adapter name
      const wallet = wallets.find((w) => w.adapter.name === walletConfig.id);
      return wallet ? (
        <SolanaWalletButton
          key={index}
          wallet={wallet}
          logoUrl={walletConfig.logoUrl}
        />
      ) : null;
    } else if (walletConfig.type === "evm") {
      // Find EVM connector by type
      const connector = connectors.find((c) => c.type === walletConfig.id);
      return connector ? (
        <WalletButton
          key={index}
          connector={connector}
          logoUrl={walletConfig.logoUrl}
        />
      ) : null;
    } else if (walletConfig.type === "walletconnect") {
      // WalletConnect
      return walletConnectParams ? (
        <WalletConnectButton key={index} logoUrl={walletConfig.logoUrl} />
      ) : null;
    }
    return null;
  };

  return <>{featuredWallets.map(renderWalletButton)}</>;
};
