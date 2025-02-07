import { ExternalLinkIcon } from "@/components/icons/external-link";
import { TransactionType } from "../../hooks/7702/useRecurringTransactions";
import { CheckCircleFilledIcon } from "@/components/icons/check-circle-filled";
import { LoadingIcon } from "@/components/icons/loading";
import { useEffect, useState } from "react";

export type loadingState = "loading" | "success" | "initial";

export const Transactions = ({
  transactions,
}: {
  transactions: TransactionType[];
}) => {
  return (
    <div>
      {transactions.map((transaction, i) => (
        <Transaction key={i} {...transaction} />
      ))}
    </div>
  );
};

const Transaction = ({
  className,
  externalLink,
  buyAmountUsdc,
  state,
}: TransactionType & { className?: string }) => {
  const [countdownSeconds, setCountdownSeconds] = useState<number>(10);

  useEffect(() => {
    if (state === "next") {
      const interval = setInterval(() => {
        setCountdownSeconds((prev) => (prev === 0 ? 0 : prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdownSeconds(10);
    }
  }, [state]);

  const getText = () => {
    if (state === "initial") {
      return "Waiting...";
    }
    if (state === "initiating") {
      return "Buying 1 ETH";
    }
    if (state === "next") {
      return `Next buy in ${countdownSeconds} seconds`;
    }
    if (state === "complete") {
      return `Bought 1 ETH for ${buyAmountUsdc.toLocaleString()} USDC`;
    }
  };

  return (
    <div className={`flex justify-between ${className} mb-4`}>
      <div className="flex items-center mr-1">
        <div className="w-4 h-4 mr-2">
          {state === "complete" ? (
            <CheckCircleFilledIcon className=" h-4 w-4 fill-demo-surface-success" />
          ) : (
            <LoadingIcon className="h-4 w-4" />
          )}
        </div>
        <p className="text-sm text-fg-secondary">{getText()}</p>
      </div>
      {externalLink && state === "complete" && (
        <a href={externalLink} target="_blank" rel="noreferrer">
          <div className="w-4 h-4">
            <ExternalLinkIcon className="stroke-fg-secondary" />
          </div>
        </a>
      )}
    </div>
  );
};
