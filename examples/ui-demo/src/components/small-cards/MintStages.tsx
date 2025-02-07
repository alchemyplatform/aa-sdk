import { CheckCircleFilledIcon } from "@/components/icons/check-circle-filled";
import { LoadingIcon } from "@/components/icons/loading";
import { MintStatus } from "./MintCardMAv2";
import { loadingState } from "./Transactions";

export const MintStages = ({ status }: { status: MintStatus }) => {
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
        description="Deploying your smart account..."
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
  description: string | JSX.Element;
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
