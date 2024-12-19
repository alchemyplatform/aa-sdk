import { useState } from "react";
import { cn } from "@/lib/utils";

import { SettingsIcon } from "../icons/settings";
// import { HelpTooltip } from "../shared/HelpTooltip";
import { WalletTypeSwitch } from "../shared/WalletTypeSwitch";
import ExternalLink from "../shared/ExternalLink";

enum WalletTypes {
  smart = "smart",
  smart7702 = "7702",
}
export const Configuration = ({ className }: { className?: string }) => {
  const [walletType, setWalletType] = useState(WalletTypes.smart);

  const onSwitchWalletType = () => {
    setWalletType(
      walletType === WalletTypes.smart
        ? WalletTypes.smart7702
        : WalletTypes.smart
    );
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-row gap-2 items-center pb-5">
        <SettingsIcon />
        <span className="font-semibold">Configuration</span>
      </div>
      <div className="flex flex-row items-center gap-2 pb-2">
        <h4 className="font-normal text-sm text-secondary-foreground">
          Embedded Wallet Type{" "}
        </h4>
        {/* <HelpTooltip text="An account powered by a smart contract to enable more features. Not an EOA. Recommended for new wallets." /> */}
      </div>
      <WalletTypeSwitch
        id="theme-switch"
        checked={walletType === WalletTypes.smart7702}
        onCheckedChange={onSwitchWalletType}
      />
      <p className="text-active text-xs font-medium pt-3">
        On sign up, create a smart account or create an EOA that delegates to a
        smart account.{" "}
        <ExternalLink className="text-[#363FF9]" href="https://google.com">
          Learn more.
        </ExternalLink>
      </p>
      <div className="w-full border-b border-border pb-5 mb-8" />
    </div>
  );
};
