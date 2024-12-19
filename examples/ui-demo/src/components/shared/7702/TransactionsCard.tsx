import { Key } from "@/components/icons/key";
import { Button } from "./Button";
import { useState } from "react";
import { Transactions } from "./Transactions";
import { TransactionType } from "./useTransaction";

export const TransactionsCard = ({
  isLoading,
  transactions,
  handleTransactions,
}: {
  isLoading: boolean;
  transactions: TransactionType[];
  handleTransactions: () => void;
}) => {
  const [isFiring, setIsFiring] = useState(false);
  const handleClick = () => {
    setIsFiring(true);
    handleTransactions();
  };
  return (
    <div
      className="bg-bg-surface-default rounded-lg p-6 w-[278px] h-[430px] flex flex-col"
      style={{
        boxShadow:
          "0px 50px 50px 0px rgba(0, 0, 0, 0.09), 0px 12px 27px 0px rgba(0, 0, 0, 0.10)",
      }}
    >
      <div
        className="rounded-xl w-full h-[170px] mb-3 flex justify-center items-center"
        style={{
          background: `rgba(54, 63, 249, 0.05)`,
        }}
      >
        <Key />
      </div>
      <h3 className="text-fg-primary text-xl font-semibold">
        Recurring transactions
      </h3>
      {!isFiring ? (
        <p className="text-fg-primary text-sm">
          Set up a dollar-cost average order by creating a session key with
          permission to buy ETH every 10 seconds.
        </p>
      ) : (
        <Transactions transactions={transactions} />
      )}

      <Button className="mt-auto" onClick={handleClick} disabled={isLoading}>
        Create session key
      </Button>
    </div>
  );
};
