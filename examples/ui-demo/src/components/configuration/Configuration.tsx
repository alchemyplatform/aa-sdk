// import { useState } from "react";
import { cn } from "@/lib/utils";

import { SettingsIcon } from "../icons/settings";
// import { HelpTooltip } from "../shared/HelpTooltip";
import { WalletTypeSwitch } from "../shared/WalletTypeSwitch";
import ExternalLink from "../shared/ExternalLink";
import { useConfigStore } from "@/state";
import { WalletTypes } from "@/app/config";

export const Configuration = ({ className }: { className?: string }) => {
  const { setWalletType, walletType } = useConfigStore();
  // const [walletType, setWalletType] = useState(WalletTypes.smart);

  const onSwitchWalletType = () => {
    setWalletType(
      walletType === WalletTypes.smart
        ? WalletTypes.hybrid7702
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
        <label
          className="font-normal text-sm text-secondary-foreground"
          htmlFor="wallet-switch"
        >
          Embedded wallet type
        </label>
        {/* <HelpTooltip text="An account powered by a smart contract to enable more features. Not an EOA. Recommended for new wallets." /> */}
      </div>
      <WalletTypeSwitch
        id="wallet-switch"
        checked={walletType === WalletTypes.hybrid7702}
        onCheckedChange={onSwitchWalletType}
      />
      <p className="text-active text-xs font-normal pt-3">
        EIP-7702 adds smart account features to an EOA wallet.{" "}
        <ExternalLink
          className="text-[#363FF9] whitespace-nowrap"
          href="https://www.alchemy.com/blog/eip-7702-ethereum-pectra-hardfork?utm_source=what_is_7702&utm_medium=demo&utm_campaign=eip_7702_series"
        >
          Learn more.
        </ExternalLink>
      </p>
      <div className="w-full border-b border-border pb-5 mb-8" />
    </div>
  );
};
