import { useConfigStore } from "@/state";
import { MFACard } from "./MFACard";
import { MintCard } from "./MintCard";
import { SolanaNftCard } from "./SolanaNftCard";
import { TransactionsCard } from "./TransactionsCard";
import { Erc20SponsorshipCard } from "./Erc20SponsorshipCard";
import { PayCard } from "./PayCard";

export const SmallCardsWrapper = () => {
  const { accountMode } = useConfigStore();
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:my-6 items-center w-full">
      {/* <Erc20SponsorshipCard
        accountMode={accountMode}
        key={`erc20-sponsorship-card-${accountMode}`}
      />
      <MintCard accountMode={accountMode} key={`mint-card-${accountMode}`} /> */}
      <PayCard accountMode="7702" />
      {/* <TransactionsCard
        accountMode={accountMode}
        key={`transactions-card-${accountMode}`}
      /> */}
      {/* <SolanaNftCard />
      <MFACard /> */}
    </div>
  );
};
