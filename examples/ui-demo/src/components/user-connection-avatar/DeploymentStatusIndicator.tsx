import { cn } from "@/lib/utils";
import { CheckCircleFilledIcon } from "@/components/icons/check-circle-filled";
import { HTMLAttributes } from "react";
type DeploymentStatusIndicatorProps = {
  isDeployed: boolean;
  showCheckIcon?: boolean;
};

const DeploymentStatusIndicator = ({
  isDeployed,
  showCheckIcon = false,
  className,
  ...props
}: DeploymentStatusIndicatorProps & HTMLAttributes<HTMLDivElement>) => {
  const displayCheckIcon = isDeployed && showCheckIcon;

  const indicatorBackgroundColor = isDeployed
    ? displayCheckIcon
      ? "#FFF"
      : "bg-bg-surface-success"
    : "bg-bg-surface-warning";

  return (
    <div
      className={cn(
        "w-[16px] h-[16px] rounded-full",
        indicatorBackgroundColor,
        className
      )}
      {...props}
    >
      {displayCheckIcon && (
        <CheckCircleFilledIcon className="fill-demo-surface-success" />
      )}
    </div>
  );
};

export { DeploymentStatusIndicator };
