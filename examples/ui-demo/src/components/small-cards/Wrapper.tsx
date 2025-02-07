import { MintCardMAv2 } from "./MintCardMAv2";
import { useMint } from "../../hooks/7702/useMint";
//import { TransactionsCard } from "./TransactionsCard";
//import { useRecurringTransactions } from "../../hooks/7702/useRecurringTransactions";
import { useConfigStore } from "@/state";

export const SmallCardsWrapper = () => {
  const { walletType } = useConfigStore();

  const {
    isLoading: isLoadingMint,
    status,
    nftTransfered,
    handleCollectNFT,
    uri,
  } = useMint();

  // TODO(jh): worry about this next
  // const { cardStatus, transactions, handleTransactions, isLoadingClient } =
  //   useRecurringTransactions();

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:mt-6 items-center p-6">
      <MintCardMAv2
        isLoading={
          isLoadingMint
          // || cardStatus === "setup" || cardStatus === "active"
        }
        // isDisabled={cardStatus === "setup" || cardStatus === "active"}
        status={status}
        nftTransfered={nftTransfered}
        handleCollectNFT={handleCollectNFT}
        uri={uri}
      />
      {/* TODO(jh): worry about this next */}
      {/* <TransactionsCard
        isDisabled={isLoadingClient}
        cardStatus={cardStatus}
        transactions={transactions}
        handleTransactions={handleTransactions}
      /> */}
    </div>
  );
};
