import { ExternalLinkIcon } from "@/components/icons/external-link";
import { CheckCircleFilledIcon } from "@/components/icons/check-circle-filled";
import { LoadingIcon } from "@/components/icons/loading";
import { TransactionType } from "@/hooks/useRecurringTransactions";
import { cn } from "@/lib/utils";

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
  secUntilBuy = 0,
}: TransactionType & { className?: string }) => {
  const getText = () => {
    if (state === "initial") {
      return "Waiting...";
    }
    if (state === "next") {
      return secUntilBuy <= 0
        ? "Waiting for previous transaction..."
        : `Next buy in ${secUntilBuy} second${secUntilBuy === 1 ? "" : "s"}`;
    }
    if (state === "initiating") {
      return "Buying 1 ETH";
    }
    if (state === "complete") {
      return `Bought 1 ETH for ${buyAmountUsdc.toLocaleString()} USDC`;
    }
  };

  return (
    <div className={cn("flex justify-between mb-4", className)}>
      <div className="flex items-center mr-1">
        <div className="w-4 h-4 mr-2">
          {state === "complete" ? (
            <CheckCircleFilledIcon className="h-4 w-4 fill-demo-surface-success" />
          ) : (
            <LoadingIcon className="h-4 w-4" />
          )}
        </div>
        <p className="text-sm text-fg-secondary">{getText()}</p>
      </div>
      {externalLink && state === "complete" && (
        <a href={externalLink} target="_blank" rel="noreferrer">
          <ExternalLinkIcon className="stroke-fg-secondary h-4 w-4" />
        </a>
      )}
    </div>
  );
};
