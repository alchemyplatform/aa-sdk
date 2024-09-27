import { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { DeploymentStatusIndicator } from "@/components/shared/DeploymentStatusIndicator";
import { UserAddressLink } from "@/components/shared/user-connection-avatar/UserAddressLink";
import { useUser, useLogout, useSigner } from "@account-kit/react";
import { UserConnectionAvatar } from "@/components/shared/user-connection-avatar/UserConnectionAvatar";
import { LogoutIcon } from "@/components/icons/logout";
import { useConfig } from "@/app/state";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon } from "@/components/icons/external-link";

type UserConnectionAvatarWithPopoverProps = {
  deploymentStatus: boolean;
};
export const UserConnectionAvatarWithPopover = ({
  deploymentStatus,
}: UserConnectionAvatarWithPopoverProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const user = useUser();
  const [signerAddress, setSignerAddress] = useState<string | null>(null);
  const { logout } = useLogout();
  const { config } = useConfig();
  const signer = useSigner();

  const getSignerAddress = async (): Promise<string | null> => {
    const signerAddress = await signer?.getAddress();
    return signerAddress ?? null;
  };

  useEffect(() => {
    getSignerAddress().then((address) => {
      address && setSignerAddress(address);
    });
  }, [signer]);

  const theme = config.ui.theme;
  const primaryColor = config.ui.primaryColor;

  if (!user) return null;

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={(open: boolean) => {
        setIsPopoverOpen(open);
      }}
    >
      <PopoverTrigger>
        <UserConnectionAvatar
          isFocused={isPopoverOpen}
          deploymentStatus={deploymentStatus}
        />
      </PopoverTrigger>
      <PopoverContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        align="start"
        className={cn(
          "border border-solid border-[#E2E8F0] min-w-[274px] bg-bg-surface-default",
          theme === "dark" && "border-[#374141]"
        )}
      >
        <div className="flex flex-col gap-2">
          {/* Smart Account */}
          <div className="flex flex-row justify-between">
            <span className="text-sm text-fg-secondary">Smart account</span>
            <UserAddressLink address={user?.address} />
          </div>
          {/* Status */}
          <div className="flex flex-row justify-between items-center">
            <span className="text-sm text-fg-secondary">Status</span>
            <div className="flex flex-row items-center">
              <DeploymentStatusIndicator
                isDeployed={deploymentStatus}
                className="w-[12px] h-[12px]"
              />
              <span className="text-fg-primary block ml-1 text-sm">
                {deploymentStatus ? "Deployed" : "Not deployed"}
              </span>
            </div>
          </div>
          {/* Signer */}
          <div className="flex flex-row justify-between items-center mt-[17px]">
            <a
              target="_blank"
              href="https://accountkit.alchemy.com/concepts/smart-account-signer"
              className="flex justify-center items-center"
            >
              <span className="text-sm text-fg-secondary mr-1">Signer</span>
              <div className="flex flex-row justify-center items-center w-[14px] h-[14px] ml-1">
                <ExternalLinkIcon
                  stroke={theme === "light" ? "#475569" : "#E2E8F0"}
                />
              </div>
            </a>

            <UserAddressLink address={signerAddress} />
          </div>

          {/* Logout */}

          <button
            className="flex flex-row justify-start items-center mt-[17px] hover:cursor-pointer active:opacity-70"
            onClick={() => {
              logout();
            }}
          >
            <span className="font-semibold text-xs text-btn-primary">
              Logout
            </span>

            <div className="w-[14px] h-[14px] ml-2">
              <LogoutIcon stroke={primaryColor[theme]} />
            </div>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
