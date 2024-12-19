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
    <div className="flex gap-6">
      <MintCard7702
        isLoading={isLoadingMint || isLoadingTransactions}
        isDisabled={isLoadingTransactions}
        status={status}
        nftTransfered={nftTransfered}
        handleCollectNFT={handleCollectNFT}
        uri={uri}
      />
      <TransactionsCard
        isDisabled={isLoadingMint}
        isLoading={isLoadingTransactions}
        transactions={transactions}
        handleTransactions={handleTransactions}
      />
    </div>
  );
};
