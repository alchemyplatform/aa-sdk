import PopoverMenu from "@/components/shared/user-connection-avatar/UserConnectionMenuPopover";
import DialogMenu from "@/components/shared/user-connection-avatar/UserConnectionMenuDialog";
import { UserConnectionAvatar } from "./UserConnectionAvatar";
import { UserConnectionDetails } from "./UserConnectionDetails";
import React, { useState } from "react";

export const RenderUserConnectionAvatar = () => {
  return (
    <div className="border-b border-border pb-6 md:border-none md:pb-0">
      {/* Popover - Visible on desktop screens */}
      <div className="hidden md:block">
        <RenderPopoverMenu />
      </div>
      {/* Dialog - Visible on mobile screens */}
      <div className="block md:hidden">
        <RenderDialogMenu />
      </div>
    </div>
  );
};

const RenderPopoverMenu = () => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <PopoverMenu onOpenStateChange={(state) => setPopoverOpen(state)}>
      <PopoverMenu.Trigger>
        <UserConnectionAvatar isFocused={popoverOpen} />
      </PopoverMenu.Trigger>
      <PopoverMenu.Content>
        <UserConnectionDetails />
      </PopoverMenu.Content>
    </PopoverMenu>
  );
};

const RenderDialogMenu = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <DialogMenu.Trigger toggleOpenState={() => setDialogOpen(!dialogOpen)}>
        <UserConnectionAvatar isFocused={dialogOpen} />
      </DialogMenu.Trigger>
      <DialogMenu isOpen={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogMenu.Content>
          <p className="text-lg font-semibold text-fg-primary mb-5">Profile</p>
          <UserConnectionDetails />
        </DialogMenu.Content>
      </DialogMenu>
    </>
  );
};
