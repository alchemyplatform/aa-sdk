import { getMintIcon } from "./MintStages";
import { loadingState } from "./Transactions";

export const Stage = ({
  icon,
  description,
  className,
}: {
  icon: JSX.Element;
  description: string | JSX.Element;
  className?: string;
}) => {
  return (
    <div className={`flex mb-4 items-center ${className}`}>
      <div className="w-4 h-4 mr-2">{icon}</div>
      <p className="text-sm text-fg-secondary w-full">{description}</p>
    </div>
  );
};
