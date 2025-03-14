import { SolanaCard } from "./SolanaCard";
import { TransactionsCard } from "./TransactionsCard";
import { MintCard } from "./MintCard";

export const SmallCardsWrapper = () => {
  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:mt-6 items-center p-6 w-full justify-center max-w-screen-sm xl:max-w-none">
      <MintCard />
      <SolanaCard />
      <TransactionsCard />
    </div>
  );
};
