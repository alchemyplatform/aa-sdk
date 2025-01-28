import PopoverMenu from "@/components/shared/user-connection-avatar/UserConnectionMenuPopover";
import DialogMenu from "@/components/shared/user-connection-avatar/UserConnectionMenuDialog";
import { UserConnectionAvatar } from "./UserConnectionAvatar";
import { UserConnectionDetails } from "./UserConnectionDetails";
import React, { useEffect, useState } from "react";
import { useAccount, useSigner } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import { useConfigStore } from "@/state";
import { WalletTypes } from "@/app/config";
import { createPublicClient, Hex, http } from "viem";
import { odysseyTestnet } from "viem/chains";

type RenderAvatarMenuProps = {
  deploymentStatus: boolean;
  delegationAddress?: Hex;
};
export const RenderUserConnectionAvatar = (
  props: React.HTMLAttributes<HTMLDivElement>
) => {
  const { account } = useAccount({
    type: "LightAccount",
  });
  const { walletType } = useConfigStore();

  const publicClient = createPublicClient({
    chain: odysseyTestnet,
    transport: http(),
  });

  const signer = useSigner();

  const { nftTransferred } = useConfigStore(({ nftTransferred }) => ({
    nftTransferred,
  }));

  const { data: hybridAccount, refetch: refetch7702 } = useQuery({
    queryKey: ["deploymentStatus7702"],
    queryFn: async () => {
      const delegationAddress = signer
        ? await publicClient.getCode({
            address: await signer?.getAddress(),
          })
        : "0x";
      const delegationStatus = delegationAddress !== "0x";
      return {
        delegationAddress,
        delegationStatus,
      };
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
    }

    if (nftTransferred && !hybridAccount?.delegationStatus) {
      refetch7702();
    }
  }, [
    nftTransferred,
    deploymentStatusSCA,
    refetchSCA,
    hybridAccount?.delegationStatus,
    refetch7702,
  ]);

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
              ? hybridAccount
                ? hybridAccount.delegationStatus
                : false
              : deploymentStatusSCA
          }
          delegationAddress={
            hybridAccount ? hybridAccount.delegationAddress : "0x"
          }
        />
      </div>
      {/* Dialog - Visible on mobile screens */}
      <div className="block lg:hidden">
        <RenderDialogMenu
          deploymentStatus={
            walletType === WalletTypes.hybrid7702
              ? hybridAccount
                ? hybridAccount.delegationStatus
                : false
              : deploymentStatusSCA
          }
          delegationAddress={
            hybridAccount ? hybridAccount.delegationAddress : "0x"
          }
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
