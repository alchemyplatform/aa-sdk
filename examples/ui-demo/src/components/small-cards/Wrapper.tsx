import { useConfigStore } from "@/state";
import { WalletTypes } from "@/app/config";
import { MintCard7702, MintCardDefault } from "./MintCard";
import {
  TransactionsCard7702,
  TransactionsCardDefault,
} from "./TransactionsCard";
import { useChain } from "@account-kit/react";
import { useEffect } from "react";
import { arbitrumSepolia } from "@account-kit/infra";
import { odyssey } from "@/hooks/7702/transportSetup";

export const SmallCardsWrapper = () => {
  const { walletType } = useConfigStore();

  const chain = walletType === WalletTypes.smart ? arbitrumSepolia : odyssey;
  const { chain: activeChain, setChain, isSettingChain } = useChain();
  useEffect(() => {
    if (isSettingChain || chain.id === activeChain.id) {
      return;
    }
    setChain({ chain });
  }, [activeChain.id, chain, isSettingChain, setChain]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:mt-6 items-center p-6">
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
