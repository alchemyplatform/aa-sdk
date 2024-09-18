import { useConfig } from "@/app/state";
import { cn } from "@/lib/utils";
import { AuthCard, useLogout, useUser } from "@account-kit/react";
import { useState } from "react";
import { MintDemoWrapper } from "./MintDemoWrapper";

export function AuthCardWrapper({ className }: { className?: string }) {
  const user = useUser();
  const {config, setConfig} = useConfig();
  const { logout } = useLogout();

  const handleAuthSuccess = () => {
    console.log("Auth Success");
    setConfig((prev) => ({...prev, auth: {...prev.auth, isAuthComplete: true}}));
  }
  return (
    <div
      className={cn(
        "flex flex-1 flex-col justify-center items-center overflow-auto relative",
        config.ui.theme === "dark" ? "bg-black/70" : "bg-[#EFF4F9]",
        className
      )}
    >
      {!config.auth.isAuthComplete ? (   <>
             <div className="flex flex-col gap-2 w-[368px]">
          <div className="modal bg-surface-default shadow-md overflow-hidden">
            <AuthCard handleAuthSuccess={handleAuthSuccess} />
          </div>
        </div>
        
          </>):
          <MintDemoWrapper />
        }
        {user && (<button
          className="text-primary font-semibold text-sm px-3 py-[11px] bg-white border border-gray-300 rounded-lg hover:shadow-md"
          onClick={() => {
            setConfig((prev) => ({...prev, auth: {...prev.auth, isAuthComplete: false}}));
            logout()}}
          >
          Logout
          {config.auth.isAuthComplete && <span> (Auth Complete)</span>}
        </button>)} 
    </div>
  );
}
