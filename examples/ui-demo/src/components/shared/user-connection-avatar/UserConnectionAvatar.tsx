import { cn } from "@/lib/utils";
import { useConfig } from "@/app/state";
import { UserAvatar } from "@/components/shared/UserAvatar";

import { useAccount, useUser } from "@account-kit/react";
import { ChevronDown } from "@/components/icons/chevron-down";
import truncateAddress from "@/utils/truncate-address";

import { DeploymentStatusIndicator } from "@/components/shared/DeploymentStatusIndicator";

interface UserConnectionAvatarProps {
  isFocused?: boolean;
  showDeploymentStatus?: boolean;
}
const UserConnectionAvatar = ({
  isFocused,
  showDeploymentStatus = true,
}: UserConnectionAvatarProps) => {
  const { config } = useConfig();
  const user = useUser();
  const { address: SCAUserAddress } = useAccount({ type: "LightAccount" });

  const isEOAUser = user?.type === "eoa";
  const { nftTransfered: deploymentStatus } = useConfig();

  const currentTheme = config.ui.theme;

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-row items-center">
      <div className="relative w-[40px] h-[40px]">
        <UserAvatar
          address={SCAUserAddress ?? user.address}
          primaryColor={config.ui.primaryColor[currentTheme]}
        />
        {showDeploymentStatus && (
          <div
            className={cn(
              "bg-[#fff] p-[2px] rounded-full absolute bottom-[-4px] left-[23px]",
              deploymentStatus && "p-[1px]"
            )}
          >
            <DeploymentStatusIndicator
              isDeployed={deploymentStatus}
              showCheckIcon
            />
          </div>
        )}
      </div>
      <div className="flex flex-col ml-3">
        <span className="text-fg-secondary text-left text-sm font-semibold">
          Hello,
        </span>
        <div className="flex flex-row items-center">
          <h3 className="text-fg-primary font-semibold text-left text-lg whitespace-nowrap">
            {isEOAUser ? truncateAddress(user.address) : user.email}
          </h3>
          <div className="ml-1 w-[20px] h-[20px] flex items-center justify-center">
            <ChevronDown
              stroke={currentTheme === "dark" ? "#fff" : "#020617"}
              className={cn("transition", isFocused && "rotate-180")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { UserConnectionAvatar };
