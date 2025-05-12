import { CheckCircleFilledIcon } from "@/components/icons/check-circle-filled";
import { LoadingIcon } from "@/components/icons/loading";
import { loadingState } from "./Transactions";
import { ExternalLinkIcon } from "@/components/icons/external-link";
import { MintStatus } from "../small-cards/MintCard";
import { Stage } from "./Stage";

export const MintStages = ({
  status,
  transactionUrl,
}: {
  status: MintStatus;
  transactionUrl?: string;
}) => {
  return (
    <div>
      <Stage
        icon={getMintIcon(status.signing)}
        description="Invisibly signing transactions"
      />
      <Stage icon={getMintIcon(status.gas)} description="Sponsoring gas fees" />
      <Stage
        icon={getMintIcon(status.batch)}
        description={
          <span className="flex gap-3 justify-between">
            Deploying smart account
            {status.batch === "success" && transactionUrl && (
              <a
                href={transactionUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="View transaction"
              >
                <ExternalLinkIcon className="stroke-fg-secondary w-4 h-4" />
              </a>
            )}
          </span>
        }
      />
    </div>
  );
};

export const getMintIcon = (icon: loadingState) => {
  switch (icon) {
    case "loading":
    case "initial":
      return <LoadingIcon className="h-4 w-4" />;
    case "success":
      return (
        <CheckCircleFilledIcon className=" h-4 w-4 fill-demo-surface-success" />
      );
  }
};
