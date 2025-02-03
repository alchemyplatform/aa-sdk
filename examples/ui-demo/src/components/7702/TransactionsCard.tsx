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
    <div className="bg-bg-surface-default rounded-lg p-4 w-full xl:p-6 xl:w-[326px] xl:h-[478px] flex flex-col shadow-smallCard mb-5 xl:mb-0">
      <div className="flex gap-3 xl:gap-0 xl:flex-col">
        <div className="flex-shrink-0 bg-[#EAEBFE] rounded-xl mb-4 flex justify-center items-center relative h-[67px] w-[60px] sm:h-[154px] sm:w-[140px] xl:h-[222px] xl:w-full">
          <p className="absolute top-[-6px] left-[-6px] sm:top-1 sm:left-1 xl:left-auto xl:right-4 xl:top-4 px-2 py-1 font-semibold rounded-md text-xs text-[#7c3AED] bg-[#F3F3FF]">
            New!
          </p>
          <Key className="h-9 w-9 sm:h-[74px] sm:w-[74px] xl:h-[94px] xl:w-[94px]" />
        </div>
        <div className="mb-3">
          <h3 className="text-fg-primary  xl:text-xl font-semibold mb-2 xl:mb-3">
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
        </div>
      </div>
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
