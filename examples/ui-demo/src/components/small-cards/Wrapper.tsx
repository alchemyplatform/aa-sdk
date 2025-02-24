import { useConfigStore } from "@/state";
import { WalletTypes } from "@/app/config";
import { MintCard7702, MintCardDefault } from "./MintCard";
import {
  TransactionsCard7702,
  TransactionsCardDefault,
} from "./TransactionsCard";

export const SmallCardsWrapper = () => {
  const { walletType } = useConfigStore();

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
