"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/state/useTheme";
import { AuthCard, useUser, useAuthContext } from "@account-kit/react";
import { EOAPostLogin } from "../shared/eoa-post-login/EOAPostLogin";
import { MintCard } from "../shared/mint-card/MintCard";

export function AuthCardWrapper({ className }: { className?: string }) {
  const theme = useTheme();

  return (
    <div
      className={cn(
        "flex flex-col flex-1 overflow-y-auto scrollbar-none relative h-full w-full px-6 pb-6",
        theme === "dark" ? "bg-demo-bg-darkmode" : "bg-white",
        className
      )}
    >
      <div className="flex flex-1 justify-center items-center ">
        <RenderContent />
      </div>
    </div>
  );
}

const RenderContent = () => {
  const { authStep } = useAuthContext();
  const user = useUser();
  const [showAuthCard, setShowAuthCard] = useState(() => !user);

  useEffect(() => {
    // Show auth card for unauthenticated users
    if (!user) {
      setShowAuthCard(true);

      // Get auth details for authenticated users
    } else if (!!user && ["complete", "initial"].includes(authStep.type)) {
      setShowAuthCard(false);
    }
  }, [authStep.type, user]);

  if (showAuthCard) {
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

  const isEOAUser = user?.type === "eoa";

  if (isEOAUser) {
    return (
      <div className="h-full w-full pb-10 pt-5 flex flex-col justify-center items-center">
        <EOAPostLogin />
      </div>
    );
  }

  return <MintCard />;
};
