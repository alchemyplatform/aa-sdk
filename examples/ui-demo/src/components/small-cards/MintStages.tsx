import { CheckCircleFilledIcon } from "@/components/icons/check-circle-filled";
import { LoadingIcon } from "@/components/icons/loading";
import { MintStatus } from "./MintCard";
import { loadingState } from "./Transactions";
import { ReactNode } from "react";
import { ExternalLinkIcon } from "lucide-react";

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
        icon={status.signing}
        description="Invisibly signing txs for you..."
      />
      <Stage
        icon={status.gas}
        description="Sponsoring gas behind the scenes..."
      />
      {/* TODO(jh): this is a lie if it not the smart account's first txn... */}
      <Stage
        icon={status.batch}
        description={
          <span className="flex gap-3 justify-between">
            Deploying your smart account...
            {status.batch === "success" && transactionUrl && (
              <a
                href={transactionUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center"
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

const Stage = ({
  icon,
  description,
  className,
}: {
  icon: loadingState;
  description: string | ReactNode;
  className?: string;
}) => {
  return (
    <div className={`flex mb-4 items-center ${className}`}>
      <div className="w-4 h-4 mr-2">{getMintIcon(icon)}</div>
      <p className="text-sm text-fg-secondary">{description}</p>
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
