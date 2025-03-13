import { useConfigStore } from "@/state";
import { MintCard7702, MintCardDefault } from "./MintCard";
import { SolanaCard } from "./SolanaCard";
import {
  TransactionsCard7702,
  TransactionsCardDefault,
} from "./TransactionsCard";
import { MFACard } from "./MFACard";

export const SmallCardsWrapper = () => {
  const { accountMode } = useConfigStore();

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:mt-6 items-center p-6 w-full justify-center max-w-screen-sm xl:max-w-none">
      {accountMode === "default" ? (
        <>
          <MintCardDefault />
          <SolanaCard />
          <TransactionsCardDefault />
          <MFACard />
        </>
      ) : (
        <>
          <MintCard7702 />
          <SolanaCard />
          <TransactionsCard7702 />
          <MFACard />
        </>
      )}
    </div>
  );
};
