import { SolanaCard } from "./SolanaCard";
import { TransactionsCard } from "./TransactionsCard";
import { MintCard } from "./MintCard";
import { useConfigStore } from "@/state";
import { MFACard } from "./MFACard";

export const SmallCardsWrapper = () => {
  const { accountMode } = useConfigStore();
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-3 lg:mt-0 items-center w-full">
      <MintCard accountMode={accountMode} key={`mint-card-${accountMode}`} />
      <TransactionsCard
        accountMode={accountMode}
        key={`transactions-card-${accountMode}`}
      />
      <SolanaCard />
      <MFACard />
    </div>
  );
};
