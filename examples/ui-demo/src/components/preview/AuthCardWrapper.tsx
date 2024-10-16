"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/state/useTheme";
import { AuthCard, useUser } from "@account-kit/react";
import { EOAPostLogin } from "../shared/eoa-post-login/EOAPostLogin";
import { MintCard } from "../shared/mint-card/MintCard";

export function AuthCardWrapper({ className }: { className?: string }) {
  const theme = useTheme();

  return (
    <div
      className={cn(
        "flex flex-col flex-1 overflow-y-auto scrollbar-none relative h-full w-full",
        theme === "dark" ? "bg-[#4D4D4D]" : "bg-white",
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
        <div
          className="radius bg-bg-surface-default overflow-hidden"
          style={{
            boxShadow:
              "0px 290px 81px 0px rgba(0, 0, 0, 0.00), 0px 186px 74px 0px rgba(0, 0, 0, 0.01), 0px 104px 63px 0px rgba(0, 0, 0, 0.05), 0px 46px 46px 0px rgba(0, 0, 0, 0.09), 0px 12px 26px 0px rgba(0, 0, 0, 0.10)",
          }}
        >
          <AuthCard />
        </div>
      </div>
    );
  }

  const isEOAUser = user.type === "eoa";

  if (isEOAUser) {
    return (
      <div className="pt-[104px] h-full w-full">
        <div className="py-10 w-full h-full flex flex-col justify-center items-center">
          <EOAPostLogin />
        </div>
      </div>
    );
  }

  return (
    <div className="py-14 pt-20">
      <MintCard />
    </div>
  );
};
