import { cn } from "@/lib/utils";
import { useCallback } from "react";

export type Tab = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

export const Tabs = ({
  className,
  tabs,
  activeTab,
  setActive,
}: {
  className?: string;
  tabs: Tab[];
  activeTab: string;
  setActive: (tab: string) => void;
}) => {
  const renderTab = useCallback(
    (tab: Tab, isActive: boolean) => {
      return (
        <div
          id={tab.id}
          className={cn(
            "flex flex-col items-center justify-center h-9 w-full cursor-pointer border-b-2 -mb-[1.5px]",
            isActive ? "border-foreground" : "border-transparent"
          )}
          onClick={() => setActive(tab.id)}
        >
          <div className={cn("flex flex-1 items-center gap-1", isActive ? "text-foreground" : "text-secondary-foreground")}>
            {tab.icon}
            <p className={cn("text-lg", isActive && "font-semibold")}>{tab.name}</p>
          </div>
        </div>
      );
    },
    [setActive]
  );

  return (
    <div className={cn("flex border-b", className)}>
      {tabs.map((tab) => renderTab(tab, tab.id === activeTab))}
    </div>
  );
};
