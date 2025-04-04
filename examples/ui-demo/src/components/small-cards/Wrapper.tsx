import { useConfigStore } from "@/state";
import { MFACard } from "./MFACard";
import { MintCard } from "./MintCard";
import { SolanaCard } from "./SolanaCard";
import { TransactionsCard } from "./TransactionsCard";

export const SmallCardsWrapper = () => {
  const { accountMode } = useConfigStore();
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:my-6 items-center w-full">
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
