import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ComponentPropsWithoutRef, PropsWithChildren, useState } from "react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/state/useTheme";

type UserConnectionPopoverMenuProps = {
  onOpenStateChange?: (open: boolean) => void;
} & PropsWithChildren;

const UserConnectionPopoverMenu = ({
  children,
  onOpenStateChange,
}: UserConnectionPopoverMenuProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={(open: boolean) => {
        setIsPopoverOpen(open);
        onOpenStateChange && onOpenStateChange(open);
      }}
    >
      {children}
    </Popover>
  );
};

const MenuTrigger = (
  props: PropsWithChildren & ComponentPropsWithoutRef<typeof PopoverTrigger>,
) => {
  return <PopoverTrigger {...props}>{props.children}</PopoverTrigger>;
};

const MenuContent = (
  props: PropsWithChildren & ComponentPropsWithoutRef<typeof PopoverContent>,
) => {
  const theme = useTheme();

  return (
    <PopoverContent
      {...props}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onCloseAutoFocus={(e) => e.preventDefault()}
      align="start"
      className={cn(
        "border border-solid border-[#E2E8F0] min-w-[274px] bg-bg-surface-default",
        theme === "dark" && "border-[#374141]",
      )}
    >
      {props.children}
    </PopoverContent>
  );
};

UserConnectionPopoverMenu.Trigger = MenuTrigger;
UserConnectionPopoverMenu.Content = MenuContent;

export default UserConnectionPopoverMenu;
