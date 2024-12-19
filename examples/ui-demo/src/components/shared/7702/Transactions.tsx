import { ExternalLinkIcon } from "@/components/icons/external-link";
import { TransactionType } from "./useTransaction";
import { CheckCircleFilledIcon } from "@/components/icons/check-circle-filled";
import { LoadingIcon } from "@/components/icons/loading";

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
  description,
  state,
}: TransactionType & { className?: string }) => {
  const getText = () => {
    if (state === "initial") {
      return "";
    }
    if (state === "initiating") {
      return "Initiating buy...";
    }
    if (state === "next") {
      return "Next buy in 10 seconds...";
    }
    return description;
  };

  return (
    <div className={`flex ${className}`}>
      <div className="w-4 h-4 mr-2">
        {state === "complete" ? (
          <CheckCircleFilledIcon className=" h-4 w-4 fill-demo-surface-success" />
        ) : (
          <LoadingIcon className="h-4 w-4" />
        )}
      </div>
      <p className="text-sm text-fg-secondary">{getText()}</p>
      {externalLink && <ExternalLinkIcon className="w-4 h-4 ml-2" />}
    </div>
  );
};
