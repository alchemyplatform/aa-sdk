import { MintCard7702 } from "./MintCard7702";
import { TransactionsCard } from "./TransactionsCard";
import { useMint } from "../../hooks/7702/useMint";
import { useRecurringTransactions } from "../../hooks/7702/useRecurringTransactions";

export const Wrapper7702 = () => {
  const { cardStatus, transactions, handleTransactions } =
    useRecurringTransactions();
  const {
    isLoading: isLoadingMint,
    status,
    nftTransfered,
    handleCollectNFT,
    uri,
  } = useMint();
  return (
    <div className="flex max-[1200px]:flex-col gap-6 lg:mt-6 items-center p-6">
      <MintCard7702
        isLoading={
          isLoadingMint || cardStatus === "setup" || cardStatus === "active"
        }
        isDisabled={cardStatus === "setup" || cardStatus === "active"}
        status={status}
        nftTransfered={nftTransfered}
        handleCollectNFT={handleCollectNFT}
        uri={uri}
      />
      <TransactionsCard
        isDisabled={isLoadingMint}
        cardStatus={cardStatus}
        transactions={transactions}
        handleTransactions={handleTransactions}
      />
    </div>
  );
};
