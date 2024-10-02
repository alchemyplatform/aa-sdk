import PopoverMenu from "@/components/shared/user-connection-avatar/UserConnectionMenuPopover";
import DialogMenu from "@/components/shared/user-connection-avatar/UserConnectionMenuDialog";
import { UserConnectionAvatar } from "./UserConnectionAvatar";
import { UserConnectionDetails } from "./UserConnectionDetails";

export const RenderUserConnectionAvatar = () => {
  return (
    <div className="border-b border-border pb-6 md:border-none md:pb-0">
      {/* Popover - Visible on desktop screens */}
      <div className="hidden md:block">
        <PopoverMenu>
          <PopoverMenu.Trigger>
            <UserConnectionAvatar />
          </PopoverMenu.Trigger>
          <PopoverMenu.Content>
            <UserConnectionDetails />
          </PopoverMenu.Content>
        </PopoverMenu>
      </div>
      {/* Dialog - Visible on mobile screens */}
      <div className="block md:hidden">
        <DialogMenu>
          <DialogMenu.Trigger>
            <UserConnectionAvatar />
          </DialogMenu.Trigger>
          <DialogMenu.Content>
            <UserConnectionDetails />
          </DialogMenu.Content>
        </DialogMenu>
      </div>
    </div>
  );
};
