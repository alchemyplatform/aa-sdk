import { Key } from "@/components/icons/key";
import { Button } from "./Button";
import { LoadingIcon } from "@/components/icons/loading";
import { Transactions } from "./Transactions";
import {
  TransactionType,
  CardStatus,
} from "../../hooks/7702/useRecurringTransactions";

export const TransactionsCard = ({
  cardStatus,
  isDisabled,
  transactions,
  handleTransactions,
}: {
  isDisabled: boolean;
  cardStatus: CardStatus;
  transactions: TransactionType[];
  handleTransactions: () => void;
}) => {
  const getButtonText = () => {
    switch (cardStatus) {
      case "initial":
        return "Create session key";
      case "setup":
        return "Creating session key...";
      case "active":
        return "Transactions in progress...";
      case "done":
        return "Restart session key";
    }
  };

  return (
    <div className="bg-bg-surface-default rounded-lg p-6 w-[326px] h-[478px] flex flex-col shadow-smallCard mb-5 lg:mb-0">
      <div className="bg-[#EAEBFE] rounded-xl h-[67px] w-[60px] md:h-[154px] md:w-[140px] lg:h-[222px] lg:w-[326px] mb-4 flex justify-center items-center relative">
        <p className="absolute top-5 right-5 px-2 py-1 font-semibold rounded-md text-xs text-[#7c3AED] bg-[#F3F3FF]">
          New!
        </p>
        <Key />
      </div>
      <h3 className="text-fg-primary text-xl font-semibold mb-3">
        Recurring transactions
      </h3>

      {cardStatus === "initial" ? (
        <p className="text-fg-primary text-sm">
          Set up a dollar-cost average order by creating a session key with
          permission to buy ETH every 10 seconds.
        </p>
      ) : cardStatus === "setup" ? (
        <div className="flex items-center">
          <LoadingIcon className="h-4 w-4 mr-2" />
          <p className="text-fg-primary text-sm">
            Creating session key and minting USDC...
          </p>
        </div>
      ) : (
        <Transactions transactions={transactions} />
      )}

      <Button
        className="mt-auto"
        onClick={handleTransactions}
        disabled={
          isDisabled || cardStatus === "setup" || cardStatus === "active"
        }
      >
        {getButtonText()}
      </Button>
    </div>
  );
};
