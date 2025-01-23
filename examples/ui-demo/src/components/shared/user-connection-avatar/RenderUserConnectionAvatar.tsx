import PopoverMenu from "@/components/shared/user-connection-avatar/UserConnectionMenuPopover";
import DialogMenu from "@/components/shared/user-connection-avatar/UserConnectionMenuDialog";
import { UserConnectionAvatar } from "./UserConnectionAvatar";
import { UserConnectionDetails } from "./UserConnectionDetails";
import React, { useEffect, useState } from "react";
import { useAccount } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import { useConfigStore } from "@/state";

type RenderAvatarMenuProps = {
  deploymentStatus: boolean;
};
export const RenderUserConnectionAvatar = (
  props: React.HTMLAttributes<HTMLDivElement>
) => {
  const { account } = useAccount({
    type: "LightAccount",
  });

  const { nftTransferred } = useConfigStore(({ nftTransferred }) => ({
    nftTransferred,
  }));

  const { data: deploymentStatus = false, refetch } = useQuery({
    queryKey: ["deploymentStatus"],
    queryFn: async () => {
      const initCode = await account?.getInitCode();
      return initCode && initCode === "0x";
    },
    enabled: !!account,
  });

  useEffect(() => {
    // Refetch the deployment status if the NFT transferred state changes.
    // Only refetch if this is a user's first NFT Transfer...
    if (nftTransferred && !deploymentStatus) {
      refetch();
    }
  }, [nftTransferred, deploymentStatus, refetch]);

  return (
    <div className="overflow-hidden" {...props}>
      {/* Popover - Visible on desktop screens */}
      <div className="hidden lg:block overflow-hidden">
        <RenderPopoverMenu deploymentStatus={deploymentStatus} />
      </div>
      {/* Dialog - Visible on mobile screens */}
      <div className="block lg:hidden">
        <RenderDialogMenu deploymentStatus={deploymentStatus} />
      </div>
    </div>
  );
};

const RenderPopoverMenu = ({ deploymentStatus }: RenderAvatarMenuProps) => {
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
        <UserConnectionDetails deploymentStatus={deploymentStatus} />
      </PopoverMenu.Content>
    </PopoverMenu>
  );
};

const RenderDialogMenu = ({ deploymentStatus }: RenderAvatarMenuProps) => {
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
          <UserConnectionDetails deploymentStatus={deploymentStatus} />
        </DialogMenu.Content>
      </DialogMenu>
    </div>
  );
};
