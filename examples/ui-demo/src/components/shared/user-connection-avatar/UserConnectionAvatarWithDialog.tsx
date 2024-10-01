import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { UserConnectionAvatar } from "@/components/shared/user-connection-avatar/UserConnectionAvatar";
import { UserConnectionDetails } from "@/components/shared/user-connection-avatar//UserConnectionDetails";

export const UserConnectionAvatarWithDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open: boolean) => {
        setIsDialogOpen(open);
      }}
    >
      <DialogTrigger>
        <UserConnectionAvatar isFocused={isDialogOpen} />
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="absolute top-0 inset-0 bg-black bg-opacity-70 z-10 flex md:hidden" />
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="flex md:hidden"
        >
          <div className="w-full">
            <p className="text-lg font-semibold text-fg-primary mb-5">
              Profile
            </p>
            <UserConnectionDetails />
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
