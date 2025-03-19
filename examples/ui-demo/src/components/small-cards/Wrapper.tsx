import { SolanaCard } from "./SolanaCard";
import { TransactionsCard } from "./TransactionsCard";
import { MintCard } from "./MintCard";
import { useConfigStore } from "@/state";

export const SmallCardsWrapper = () => {
  const { accountMode } = useConfigStore();
  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:mt-6 items-center w-full justify-center max-w-screen-sm xl:max-w-none">
      <MintCard accountMode={accountMode} key={`mint-card-${accountMode}`} />
      <TransactionsCard
        accountMode={accountMode}
        key={`transactions-card-${accountMode}`}
      />
      <SolanaCard />
    </div>
  );
};
