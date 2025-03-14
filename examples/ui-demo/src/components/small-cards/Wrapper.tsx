import { useConfigStore } from "@/state";
import { SolanaCard } from "./SolanaCard";
import {
  TransactionsCard7702,
  TransactionsCardDefault,
} from "./TransactionsCard";
import { MintCard } from "./MintCard";

export const SmallCardsWrapper = () => {
  const { accountMode } = useConfigStore();
  console.log({ accountMode });
  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:mt-6 items-center p-6 w-full justify-center max-w-screen-sm xl:max-w-none">
      {accountMode === "default" ? (
        <>
          <MintCard is7702={false} />
          <SolanaCard />
          <TransactionsCardDefault />
        </>
      ) : (
        <>
          <MintCard is7702={true} />
          <SolanaCard />
          <TransactionsCard7702 />
        </>
      )}
    </div>
  );
};
