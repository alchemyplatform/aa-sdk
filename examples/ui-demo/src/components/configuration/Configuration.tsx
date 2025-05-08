import { cn } from "@/lib/utils";

import { SettingsIcon } from "../icons/settings";
import { WalletTypeSwitch } from "../shared/WalletTypeSwitch";
import ExternalLink from "../shared/ExternalLink";
import { useConfigStore } from "@/state";
import {
  useAccount,
  useChain,
  useSmartAccountClient,
  useUser,
} from "@account-kit/react";
import { arbitrumSepolia, baseSepolia } from "@account-kit/infra";
import { useEffect, useMemo } from "react";
import { AccountMode } from "@/app/config";
import { Chain } from "viem";

const chainForAccountMode: Record<AccountMode, Chain> = {
  default: arbitrumSepolia,
  "7702": baseSepolia,
};

export const Configuration = ({ className }: { className?: string }) => {
  const { setAccountMode, accountMode } = useConfigStore();
  const { chain, setChain } = useChain();
  const clientParams = useMemo(
    () => ({
      type: "ModularAccountV2" as const,
      accountParams: {
        mode: accountMode,
      },
    }),
    [accountMode]
  );
  const { isLoadingAccount } = useAccount(clientParams);
  const { isLoadingClient } = useSmartAccountClient(clientParams);
  const user = useUser();

  const onSwitchWalletType = () => {
    const newMode = accountMode === "default" ? "7702" : "default";
    setAccountMode(newMode);
  };

  // This must be in an effect so that it works correctly based on initial
  // state (i.e. after refreshing page if 7702 is already active).
  useEffect(() => {
    if (chain.id === chainForAccountMode[accountMode].id) return;
    setChain({
      chain: chainForAccountMode[accountMode],
    });
  }, [accountMode, chain.id, setChain]);

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
        checked={accountMode === "7702"}
        onCheckedChange={onSwitchWalletType}
        disabled={!!user && (isLoadingClient || isLoadingAccount)}
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
