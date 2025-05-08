import { Key } from "@/components/icons/key";
import { Button } from "./Button";
import { LoadingIcon } from "@/components/icons/loading";
import { Transactions } from "./Transactions";
import { useMemo } from "react";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { alchemy, arbitrumSepolia, baseSepolia } from "@account-kit/infra";
import { Card } from "./Card";

export const TransactionsCard = ({
  accountMode,
}: {
  accountMode: "7702" | "default";
}) => {
  const { cardStatus, isLoadingClient, transactions, handleTransactions } =
    useRecurringTransactions({
      mode: accountMode === "7702" ? "7702" : "default",
      chain: accountMode === "7702" ? baseSepolia : arbitrumSepolia,
      transport: alchemy({
        rpcUrl: accountMode === "7702" ? "/api/rpc-base-sepolia" : "/api/rpc",
      }),
    });
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

  const content = useMemo(
    () => (
      <>
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
      </>
    ),
    [cardStatus, transactions]
  );

  return (
    <Card
      imageSlot={
        <div className="w-full h-full bg-[#EAEBFE] flex justify-center items-center">
          <Key className="h-8 w-8 sm:h-[74px] sm:w-[74px] xl:h-[86px] xl:w-[86px]" />
        </div>
      }
      heading="Recurring transactions"
      content={content}
      buttons={
        <Button
          className="mt-auto"
          onClick={handleTransactions}
          disabled={
            isLoadingClient || cardStatus === "setup" || cardStatus === "active"
          }
        >
          {buttonText}
        </Button>
      }
    />
  );
};
