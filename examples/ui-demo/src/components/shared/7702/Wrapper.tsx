import { MintCard7702 } from "./MintCard7702";
import { TransactionsCard } from "./TransactionsCard";
import { useMint } from "./useMint";
import { useTransactions } from "./useTransaction";

export const Wrapper7702 = () => {
  const {
    isLoading: isLoadingTransactions,
    transactions,
    handleTransactions,
  } = useTransactions();
  const {
    isLoading: isLoadingMint,
    status,
    nftTransfered,
    handleCollectNFT,
    uri,
  } = useMint();
  return (
    <div className="flex max-[1200px]:flex-col gap-6 lg:mt-6 items-center border-btn-secondary radius-1">
      <MintCard7702
        isLoading={isLoadingMint || isLoadingTransactions}
        isDisabled={isLoadingTransactions}
        status={status}
        nftTransfered={nftTransfered}
        handleCollectNFT={handleCollectNFT}
        uri={uri}
      />
      <div className="lg:hidden w-full relative after:absolute after:bottom-0 after:left-6 after:right-6  after:h-[1px] after:bg-border" />
      <TransactionsCard
        isDisabled={isLoadingMint}
        isLoading={isLoadingTransactions}
        transactions={transactions}
        handleTransactions={handleTransactions}
      />
    </div>
  );
};
