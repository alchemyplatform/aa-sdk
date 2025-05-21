import { cn } from "@/lib/utils";

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
  return (
    <div className={cn("flex border-b", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <div
            key={tab.id}
            id={tab.id}
            className={cn(
              "flex flex-col items-center justify-center w-full cursor-pointer border-b-2 -mb-[1.5px] py-3",
              isActive ? "border-foreground" : "border-transparent",
            )}
            onClick={() => setActive(tab.id)}
          >
            <div
              className={cn(
                "flex flex-1 items-center gap-1",
                isActive ? "text-foreground" : "text-secondary-foreground",
              )}
            >
              {tab.icon}
              <p
                className={cn(
                  isActive && "font-semibold",
                  !isActive && "text-gray-700",
                )}
              >
                {tab.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
