import { useConfig } from "@/app/state";
import { cn } from "@/lib/utils";
import { AuthCard, useUser } from "@account-kit/react";
import { MintCard } from "../shared/MintCard";

export function AuthCardWrapper({ className }: { className?: string }) {
  const user = useUser();
  const { config } = useConfig();
  return (
    <div
      className={cn(
        "flex flex-1 flex-col justify-center items-center overflow-auto relative",
        config.ui.theme === "dark" ? "bg-black/70" : "bg-white",
        user ? "justify-start pt-[180px]" : "",
        className
      )}
    >
      {!user ? (
        <div className="flex flex-col gap-2 w-[368px]">
          <div className="modal bg-surface-default shadow-md overflow-hidden">
            <AuthCard />
          </div>
        </div>
      ) : (
        <MintCard />
      )}
    </div>
  );
}
