import { useConfigStore } from "@/state";
import { WalletTypes } from "@/app/config";
import { MintCard7702, MintCardDefault } from "./MintCard";
import {
  TransactionsCard7702,
  TransactionsCardDefault,
} from "./TransactionsCard";
import { useChain } from "@account-kit/react";
import { odyssey } from "@/hooks/7702/transportSetup";
import { arbitrumSepolia } from "@account-kit/infra";
import { useEffect } from "react";

export const SmallCardsWrapper = () => {
  const { walletType } = useConfigStore();

  const { chain: activeChain, setChain, isSettingChain } = useChain();
  const chain = walletType === WalletTypes.smart ? arbitrumSepolia : odyssey;

  useEffect(() => {
    if (!activeChain || isSettingChain || chain.id === activeChain.id) return;
    setChain({ chain });
  }, [activeChain, chain, isSettingChain, setChain]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:mt-6 items-center p-6 w-full justify-center max-w-screen-sm xl:max-w-none">
      {walletType === WalletTypes.smart ? (
        <>
          <MintCardDefault />
          <TransactionsCardDefault />
        </>
      ) : (
        <>
          <MintCard7702 />
          <TransactionsCard7702 />
        </>
      )}
    </div>
  );
};
