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

  // Show featured section if numFeaturedWallets is defined and > 1
  const hasFeaturedWallets =
    typeof config.numFeaturedWallets === "number" &&
    config.numFeaturedWallets > 0;

  // If featured wallets are configured, render them above the button
  if (hasFeaturedWallets) {
    const buttonText = config.moreButtonText ?? "More wallets";

    return (
      <div className="flex flex-col gap-3 w-full">
        <FeaturedExternalWallets config={config} />
        {!config.hideMoreButton && (
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
