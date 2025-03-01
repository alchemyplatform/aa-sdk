import { Key } from "@/components/icons/key";
import { Button } from "./Button";
import { LoadingIcon } from "@/components/icons/loading";
import { Transactions } from "./Transactions";
import { useMemo } from "react";
import {
  UseRecurringTransactionReturn,
  useRecurringTransactions,
} from "@/hooks/useRecurringTransactions";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { odyssey, splitOdysseyTransport } from "@/hooks/7702/transportSetup";

export const TransactionsCardDefault = () => {
  const recurringTxns = useRecurringTransactions({
    mode: "default",
    chain: arbitrumSepolia,
    transport: alchemy({
      rpcUrl: "/api/rpc",
    }),
  });
  return <TransactionsCardInner {...recurringTxns} />;
};

export const TransactionsCard7702 = () => {
  const recurringTxns = useRecurringTransactions({
    mode: "7702",
    chain: odyssey,
    transport: splitOdysseyTransport,
  });
  return <TransactionsCardInner {...recurringTxns} />;
};

const TransactionsCardInner = ({
  cardStatus,
  isLoadingClient,
  transactions,
  handleTransactions,
}: UseRecurringTransactionReturn) => {
  const buttonText = useMemo(() => {
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
  }, [cardStatus]);

  return (
    <div className="bg-bg-surface-default rounded-lg p-4 xl:p-6 w-full xl:w-[326px] xl:h-[500px] flex flex-col shadow-smallCard min-h-[220px]">
      <div className="flex xl:flex-col gap-4">
        <div className="flex-shrink-0 bg-[#EAEBFE] rounded-xl sm:mb-3 xl:mb-0 flex justify-center items-center relative h-[67px] w-[60px] sm:h-[154px] sm:w-[140px] xl:h-[222px] xl:w-full">
          <p className="absolute top-[-6px] left-[-6px] sm:top-1 sm:left-1 xl:left-auto xl:right-4 xl:top-4 px-2 py-1 font-semibold rounded-md text-xs text-[#7c3AED] bg-[#F3F3FF]">
            New!
          </p>
          <Key className="h-9 w-9 sm:h-[74px] sm:w-[74px] xl:h-[94px] xl:w-[94px]" />
        </div>
        <div className="w-full">
          <h3 className="text-fg-primary xl:text-xl font-semibold mb-2 xl:mb-3">
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
              <p className="text-fg-primary text-sm">Creating session key...</p>
            </div>
          ) : (
            <Transactions transactions={transactions} />
          )}
        </div>
      </div>
      <Button
        className="mt-auto w-full"
        onClick={handleTransactions}
        disabled={
          isLoadingClient || cardStatus === "setup" || cardStatus === "active"
        }
      >
        {buttonText}
      </Button>
    </div>
  );
};
