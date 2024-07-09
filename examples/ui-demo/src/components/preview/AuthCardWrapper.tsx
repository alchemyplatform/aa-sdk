import { useConfig } from "@/app/state";
import { cn } from "@/lib/utils";
import { AuthCard, useLogout, useUser } from "@account-kit/react";

export function AuthCardWrapper({ className }: { className?: string }) {
  const user = useUser();

  const { config } = useConfig();
  const { logout } = useLogout();

  return (
    <div
      className={cn(
        "flex flex-1 flex-col justify-center items-center overflow-auto",
        config.ui.theme === "dark" ? "bg-black/70" : "bg-[#EFF4F9]",
        className
      )}
    >
      {!user ? (
        <div className="flex flex-col gap-2 w-[368px]">
          <div className="modal bg-surface-default shadow-md">
          <AuthCard />
          </div>
        </div>
      ) : (
        <button className="text-primary font-semibold text-sm px-3 py-[11px] bg-white border border-gray-300 rounded-lg hover:shadow-md" onClick={() => logout()}>Logout</button>
      )}
    </div>
  );
}
