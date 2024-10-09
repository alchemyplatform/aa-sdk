"use client";

import { cn } from "@/lib/utils";
import { useConfig } from "@/state";
import { AuthCard, useUser } from "@account-kit/react";
import { EOAPostLogin } from "../shared/eoa-post-login/EOAPostLogin";
import { MintCard } from "../shared/mint-card/MintCard";

export function AuthCardWrapper({ className }: { className?: string }) {
  const { config } = useConfig();

  return (
    <div
      className={cn(
        "flex flex-col flex-1 overflow-y-auto scrollbar-none relative h-full w-full",
        config.ui.theme === "dark" ? "bg-black/70" : "bg-white",
        className
      )}
    >
      <div className="flex flex-1 justify-center items-center px-6">
        <RenderContent />
      </div>
    </div>
  );
}

const RenderContent = () => {
  const user = useUser();
  const hasUser = !!user;

  if (!hasUser) {
    return (
      <div className="flex flex-col gap-2 w-[368px]">
        <div className="modal bg-surface-default shadow-md overflow-hidden">
          <AuthCard />
        </div>
      </div>
    );
  }

  const isEOAUser = user.type === "eoa";

  if (isEOAUser) {
    return (
      <div className="py-14 pt-24 lg:pt-0 h-full lg:h-auto">
        <EOAPostLogin />
      </div>
    );
  }

  return (
    <div className="py-14 pt-20">
      <MintCard />
    </div>
  );
};
