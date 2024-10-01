import { ComponentPropsWithoutRef, PropsWithChildren, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";

const UserConnectionDialogMenu = ({ children }: PropsWithChildren) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open: boolean) => {
        setIsDialogOpen(open);
      }}
    >
      {children}
    </Dialog>
  );
};

export const MenuTrigger = (
  props: PropsWithChildren & ComponentPropsWithoutRef<typeof DialogTrigger>
) => {
  return <DialogTrigger {...props}>{props.children}</DialogTrigger>;
};

export const MenuContent = (
  props: PropsWithChildren & ComponentPropsWithoutRef<typeof DialogContent>
) => {
  return (
    <DialogContent {...props}>
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
            {props.children}
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogContent>
  );
};

UserConnectionDialogMenu.Trigger = MenuTrigger;
UserConnectionDialogMenu.Content = MenuContent;

export default UserConnectionDialogMenu;
