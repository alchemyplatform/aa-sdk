import PopoverMenu from "@/components/shared/user-connection-avatar/UserConnectionMenuPopover";
import DialogMenu from "@/components/shared/user-connection-avatar/UserConnectionMenuDialog";
import { UserConnectionAvatar } from "./UserConnectionAvatar";
import { UserConnectionDetails } from "./UserConnectionDetails";
import React, { useEffect, useState } from "react";
import { useAccount } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import { useConfigStore } from "@/state";
import { createPublicClient, http } from "viem";
import { odyssey } from "../7702/transportSetup";
import { useSma7702Client } from "../7702/useSma7702Client";
import { WalletTypes } from "@/app/config";

type RenderAvatarMenuProps = {
  deploymentStatus: boolean;
};
export const RenderUserConnectionAvatar = (
  props: React.HTMLAttributes<HTMLDivElement>
) => {
  const { account } = useAccount({
    type: "LightAccount",
  });
  const { walletType } = useConfigStore();

  const publicClient = createPublicClient({
    chain: odyssey,
    transport: http(),
  });

  const client = useSma7702Client();

  const { nftTransferred } = useConfigStore(({ nftTransferred }) => ({
    nftTransferred,
  }));

  const { data: delegationStatus = false, refetch: refetch7702 } = useQuery({
    queryKey: ["deploymentStatus7702"],
    queryFn: async () => {
      const delegation = await publicClient.getCode({
        address: client!.account.address,
      });
      return delegation !== "0x";
    },
  });

  const { data: deploymentStatusSCA = false, refetch: refetchSCA } = useQuery({
    queryKey: ["deploymentStatusSCA"],
    queryFn: async () => {
      const initCode = await account?.getInitCode();
      return initCode && initCode === "0x";
    },
    enabled: !!account,
  });

  useEffect(() => {
    // Refetch the deployment status if the NFT transferred state changes.
    // Only refetch if this is a user's first NFT Transfer...
    if (nftTransferred && !deploymentStatusSCA) {
      refetchSCA();
      refetch7702();
    }
  }, [nftTransferred, deploymentStatusSCA, refetchSCA, refetch7702]);

  return (
    <div
      className="border-b border-border overflow-hidden pb-6 lg:border-none lg:pb-0"
      {...props}
    >
      {/* Popover - Visible on desktop screens */}
      <div className="hidden lg:block overflow-hidden">
        <RenderPopoverMenu
          deploymentStatus={
            walletType === WalletTypes.hybrid7702
              ? delegationStatus
              : deploymentStatusSCA
          }
        />
      </div>
      {/* Dialog - Visible on mobile screens */}
      <div className="block lg:hidden">
        <RenderDialogMenu
          deploymentStatus={
            walletType === WalletTypes.hybrid7702
              ? delegationStatus
              : deploymentStatusSCA
          }
        />
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
