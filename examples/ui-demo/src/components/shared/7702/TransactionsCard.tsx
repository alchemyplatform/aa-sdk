import { Key } from "@/components/icons/key";
import { Button } from "./Button";
import { useState } from "react";
import { Transactions } from "./Transactions";
import { TransactionType } from "../../../hooks/7702/useRecurringTransactions";

export const TransactionsCard = ({
  isLoading,
  isDisabled,
  transactions,
  handleTransactions,
}: {
  isLoading: boolean;
  isDisabled?: boolean;
  transactions: TransactionType[];
  handleTransactions: () => void;
}) => {
  const [hasClicked, setHasClicked] = useState(false);
  const handleClick = () => {
    setHasClicked(true);
    handleTransactions();
  };
  return (
    <div className="bg-bg-surface-default rounded-lg p-6 w-[326px] h-[478px] flex flex-col shadow-none lg:shadow-smallCard mb-5 lg:mb-0">
      <div
        className="rounded-xl h-[222px] w-full mb-4 flex justify-center items-center relative"
        style={{
          background: `rgba(54, 63, 249, 0.05)`,
        }}
      >
        <p className="absolute top-5 right-5 px-2 py-1 font-semibold rounded-md text-xs text-[#7c3AED] bg-[#F3F3FF]">
          New!
        </p>
        <Key />
      </div>
      <h3 className="text-fg-primary text-xl font-semibold mb-3">
        Recurring transactions
      </h3>
      {!hasClicked ? (
        <p className="text-fg-primary text-sm">
          Set up a dollar-cost average order by creating a session key with
          permission to buy ETH every 10 seconds.
        </p>
      ) : (
        <Transactions transactions={transactions} />
      )}

      <Button
        className="mt-auto"
        onClick={handleClick}
        disabled={isLoading || isDisabled}
      >
        {!hasClicked
          ? "Create session key"
          : isLoading
          ? "Creating session key..."
          : "Restart session key"}
      </Button>
    </div>
  );
};
