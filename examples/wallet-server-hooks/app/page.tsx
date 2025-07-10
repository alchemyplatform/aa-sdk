"use client";

import { useSignerStatus } from "@account-kit/react";
import UserInfoCard from "./components/user-info-card";
import NftMintCard from "./components/nft-mint-card";
import LoginCard from "./components/login-card";
import Header from "./components/header";
import LearnMore from "./components/learn-more";
import SessionKeyCard from "./components/session-key-card";

export default function Home() {
  const signerStatus = useSignerStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      <Header />
      <div className="bg-bg-main bg-cover bg-center bg-no-repeat flex-grow">
        <main className="container mx-auto px-4 py-8 h-full">
          {signerStatus.isConnected ? (
            <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
              <div className="flex flex-col gap-8">
                <UserInfoCard />
                <LearnMore />
              </div>
              <div className="grid gap-4">
                <NftMintCard />
                <SessionKeyCard />
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full pb-[4rem]">
              <LoginCard />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
