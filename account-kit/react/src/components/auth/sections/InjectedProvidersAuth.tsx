import { Button } from "../../button.js";
import { useAuthContext } from "../context.js";
import { WalletIcon } from "../../../icons/wallet.js";
import { FeaturedExternalWallets } from "./FeaturedExternalWallets.js";
import type { AuthType } from "../types.js";

interface ExternalWalletsAuthProps {
  config: Extract<AuthType, { type: "external_wallets" }>;
}

export const ExternalWalletsAuth = ({ config }: ExternalWalletsAuthProps) => {
  const { setAuthStep } = useAuthContext();

  // Check if there are featured wallets in the new structure
  const featuredWallets =
    config.wallets?.filter((wallet) => typeof wallet.featured === "number") ||
    [];
  const hasFeaturedWallets = featuredWallets.length > 0;

  // Calculate if there are more wallets (non-featured ones)
  const nonFeaturedWallets =
    config.wallets?.filter((wallet) => typeof wallet.featured !== "number") ||
    [];
  const hasMoreWallets = nonFeaturedWallets.length > 0;

  // If featured wallets are configured, render them above the button
  if (hasFeaturedWallets) {
    const buttonText = hasMoreWallets
      ? (config.moreButtonText ?? "More wallets")
      : "Continue with a wallet";

    return (
      <div className="flex flex-col gap-3 w-full">
        <FeaturedExternalWallets config={config} />
        {hasMoreWallets && !config.hideMoreButton && (
          <Button
            variant="social"
            icon={<WalletIcon />}
            onClick={() => setAuthStep({ type: "pick_eoa" })}
          >
            {buttonText}
          </Button>
        )}
      </div>
    );
  }

  // Default behavior - show single "Continue with a wallet" button
  return (
    <Button
      variant="social"
      icon={<WalletIcon />}
      onClick={() => setAuthStep({ type: "pick_eoa" })}
    >
      Continue with a wallet
    </Button>
  );
};
