import { Button } from "./Button";
import { LoadingIcon } from "@/components/icons/loading";
import { Transactions } from "./Transactions";
import { useMemo } from "react";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { alchemy, arbitrumSepolia, baseSepolia } from "@account-kit/infra";
import { Card } from "./Card";
import Image from "next/image";

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
    [cardStatus, transactions],
  );

  return (
    <Card
      imageSlot={
        <Image
          width={326}
          height={222}
          src="/images/pen.svg"
          alt="An NFT"
          priority
          className="object-cover h-full w-full"
        />
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
