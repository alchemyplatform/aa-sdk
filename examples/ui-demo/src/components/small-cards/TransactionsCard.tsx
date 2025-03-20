import { Key } from "@/components/icons/key";
import { Button } from "./Button";
import { LoadingIcon } from "@/components/icons/loading";
import { Transactions } from "./Transactions";
import { useMemo } from "react";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { odyssey, splitOdysseyTransport } from "@/hooks/7702/transportSetup";
import { Card } from "./Card";
import { Badge } from "./Badge";

export const TransactionsCard = ({
  accountMode,
}: {
  accountMode: "7702" | "default";
}) => {
  const { cardStatus, isLoadingClient, transactions, handleTransactions } =
    useRecurringTransactions({
      mode: accountMode === "7702" ? "7702" : "default",
      chain: accountMode === "7702" ? odyssey : arbitrumSepolia,
      transport:
        accountMode === "7702"
          ? splitOdysseyTransport
          : alchemy({
              rpcUrl: "/api/rpc",
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
      badgeSlot={<Badge text="New!" className="text-[#7c3AED] bg-[#F3F3FF]" />}
      imageSlot={
        <div className="flex-shrink-0 bg-[#EAEBFE] rounded-xl flex justify-center items-center relative h-[67px] w-[60px] sm:h-[154px] sm:w-[140px] xl:h-[222px] xl:w-full">
          <Key className="h-9 w-9 sm:h-[74px] sm:w-[74px] xl:h-[94px] xl:w-[94px]" />
        </div>
      }
      heading="Recurring transactions"
      content={content}
      buttons={
        <Button
          className="mt-auto w-full"
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
