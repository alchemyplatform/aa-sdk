import PopoverMenu from "./UserConnectionMenuPopover";
import DialogMenu from "./UserConnectionMenuDialog";
import { UserConnectionAvatar } from "./UserConnectionAvatar";
import { UserConnectionDetails } from "./UserConnectionDetails";
import React, { useState } from "react";
import { Hex } from "viem";
import { useDeploymentStatus } from "@/hooks/useDeploymentStatus";

type RenderAvatarMenuProps = {
  deploymentStatus: boolean;
  delegationAddress?: Hex;
};
export const RenderUserConnectionAvatar = (
  props: React.HTMLAttributes<HTMLDivElement>,
) => {
  const { isDeployed, delegationAddress } = useDeploymentStatus();

  return (
    <div className="overflow-hidden" {...props}>
      {/* Popover - Visible on desktop screens */}
      <div className="hidden lg:block overflow-hidden">
        <RenderPopoverMenu
          deploymentStatus={isDeployed}
          delegationAddress={delegationAddress}
        />
      </div>
      {/* Dialog - Visible on mobile screens */}
      <div className="block lg:hidden">
        <RenderDialogMenu
          deploymentStatus={isDeployed}
          delegationAddress={delegationAddress}
        />
      </div>
    </div>
  );
};

const RenderPopoverMenu = ({
  deploymentStatus,
  delegationAddress,
}: RenderAvatarMenuProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <PopoverMenu onOpenStateChange={(state) => setPopoverOpen(state)}>
      <PopoverMenu.Trigger className="max-w-full">
        <UserConnectionAvatar
          isFocused={popoverOpen}
          deploymentStatus={deploymentStatus}
        />
      </PopoverMenu.Trigger>
      <PopoverMenu.Content>
        <UserConnectionDetails
          deploymentStatus={deploymentStatus}
          delegationAddress={delegationAddress}
        />
      </PopoverMenu.Content>
    </PopoverMenu>
  );
};

const RenderDialogMenu = ({
  deploymentStatus,
  delegationAddress,
}: RenderAvatarMenuProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="max-w-full">
      <DialogMenu.Trigger
        toggleOpenState={() => setDialogOpen(!dialogOpen)}
        className="max-w-full"
      >
        <UserConnectionAvatar
          isFocused={dialogOpen}
          deploymentStatus={deploymentStatus}
        />
      </DialogMenu.Trigger>
      <DialogMenu isOpen={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogMenu.Content>
          <p className="text-lg font-semibold text-fg-primary mb-5">Profile</p>
          <UserConnectionDetails
            deploymentStatus={deploymentStatus}
            delegationAddress={delegationAddress}
          />
        </DialogMenu.Content>
      </DialogMenu>
    </div>
  );
};
