import { useConfigStore } from "@/state";
import { MFACard } from "./MFACard";
import { MintCard } from "./MintCard";
import { SolanaNftCard } from "./SolanaNftCard";
import { TransactionsCard } from "./TransactionsCard";
import { Erc20SponsorshipCard } from "./Erc20SponsorshipCard";

export const SmallCardsWrapper = () => {
  const { accountMode } = useConfigStore();
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:my-6 items-center w-full">
      <Erc20SponsorshipCard accountMode={accountMode} />
      <MintCard accountMode={accountMode} key={`mint-card-${accountMode}`} />
      <TransactionsCard
        accountMode={accountMode}
        key={`transactions-card-${accountMode}`}
      />
      <SolanaNftCard />
      <MFACard />
    </div>
  );
};
