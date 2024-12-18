import { RenderUserConnectionAvatar } from "../user-connection-avatar/RenderUserConnectionAvatar";
import { MintCard7702 } from "./MintCard7702";
import { TransactionsCard } from "./TransactionsCard";
import { useMint } from "../../../hooks/7702/useMint";
import { useRecurringTransactions } from "../../../hooks/7702/useRecurringTransactions";

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
    <div className="flex max-[1200px]:flex-col gap-6 lg:mt-6 items-center border-btn-secondary border lg:border-none radius-1">
      <RenderUserConnectionAvatar className="lg:hidden w-full p-6 mb-0 pb-6 relative after:absolute after:bottom-0 after:left-6 after:right-6  after:h-[1px] after:bg-border" />
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
      <div className="lg:hidden w-full relative after:absolute after:bottom-0 after:left-6 after:right-6  after:h-[1px] after:bg-border" />
      <TransactionsCard
        isDisabled={isLoadingMint}
        cardStatus={cardStatus}
        transactions={transactions}
        handleTransactions={handleTransactions}
      />
    </div>
  );
};
