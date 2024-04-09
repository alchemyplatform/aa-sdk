"use client";

import { LogInCard } from "@/components/LogInCard";
import { ProfileCard } from "@/components/ProfileCard";
import { useAuthenticateUser } from "@/queries/authenticateUser";
import { AlchemySigner } from "@alchemy/aa-alchemy";
import { useState } from "react";
import { TurnkeyIframe } from "../components/TurnkeyIframe";

export default function Home() {
  const [signer] = useState<AlchemySigner | undefined>(() => {
    if (typeof window === "undefined") return undefined;

    return new AlchemySigner({
      client: {
        connection: {
          rpcUrl: "/api/rpc",
        },
        iframeConfig: {
          iframeContainerId: "turnkey-iframe-container-id",
        },
      },
    });
  });

  const { user, account, isLoadingUser } = useAuthenticateUser(signer);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      {isLoadingUser ? (
        // Loading spinner
        <div className="flex items-center justify-center">
          <div
            className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
          ></div>
        </div>
      ) : user != null && account != null ? (
        <ProfileCard user={user} account={account} />
      ) : (
        <LogInCard signer={signer} />
      )}
      <TurnkeyIframe />
    </main>
  );
}
