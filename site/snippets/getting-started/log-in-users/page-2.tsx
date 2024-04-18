"use client";

import { LogInCard } from "@/components/LogInCard";
import { ProfileCard } from "@/components/ProfileCard";
import { useAccount, useUser } from "@alchemy/aa-alchemy/react";
import { TurnkeyIframe } from "../components/TurnkeyIframe";

export default function Home() {
  const { account, isLoadingAccount } = useAccount({
    type: "MultiOwnerModularAccount",
  });
  const user = useUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      {isLoadingAccount ? (
        // Loading spinner
        <div className="flex items-center justify-center">
          <div
            className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
          ></div>
        </div>
      ) : user != null && account != null ? (
        <ProfileCard />
      ) : (
        <LogInCard />
      )}
      <TurnkeyIframe />
    </main>
  );
}
