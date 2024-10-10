import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";
import { useConfig } from "@/state";

import { ChevronDown } from "@/components/icons/chevron-down";
import truncateAddress from "@/utils/truncate-address";
import { useAccount, useUser } from "@account-kit/react";

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
  const { nftTransferred: deploymentStatus } = useConfig();

  const currentTheme = config.ui.theme;

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-row items-center min-w-0 overflow-hidden">
      <div className="relative w-[40px] h-[40px]">
        <UserAvatar
          address={SCAUserAddress ?? user.address}
          primaryColor={config.ui.primaryColor[currentTheme]}
        />
        {showDeploymentStatus && (
          <div
            className={cn(
              "p-[2px] rounded-full absolute bottom-[-4px] left-[23px]",
              deploymentStatus && "p-[1px]",
              currentTheme === "dark" ? "bg-[#4D4D4D]" : "bg-[white]"
            )}
          >
            <DeploymentStatusIndicator
              isDeployed={deploymentStatus}
              showCheckIcon
            />
          </div>
        )}
      </div>
      <div className="flex flex-col ml-3 min-w-0">
        <span className="text-fg-secondary text-left text-sm font-semibold">
          Hello,
        </span>
        <div className="flex flex-row items-center min-w-0">
          <h3 className="text-fg-primary font-semibold text-left text-lg text-ellipsis w-full">
            {isEOAUser ? (
              truncateAddress(user.address)
            ) : (
              <span className="block w-full overflow-hidden text-ellipsis">
                {user.email}
              </span>
            )}
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
