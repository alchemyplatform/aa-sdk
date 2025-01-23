"use client";

import { ConfigurationWrapper } from "@/components/configuration/ConfigurationWrapper";

import { MobileSplashPage } from "@/components/preview/MobileSplashPage";
import {
  EOAPostLoginActions,
  EOAPostLoginContents,
} from "@/components/shared/eoa-post-login/EOAPostLoginContents";
import { MintCard } from "@/components/shared/mint-card/MintCard";
import { Debug7702Button } from "@/components/shared/7702/Debug7702Button";
import { RenderUserConnectionAvatar } from "@/components/shared/user-connection-avatar/RenderUserConnectionAvatar";
import { Inter, Public_Sans } from "next/font/google";
import { useState } from "react";
import { TopNav } from "../components/topnav/TopNav";
import { Wrapper7702 } from "@/components/shared/7702/Wrapper";
import { ContentNav } from "@/components/content/ContentNav";
import { ContentWrapper } from "@/components/content/ContentWrapper";
import { cn } from "@/lib/utils";
import { useTheme } from "@/state/useTheme";

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  const [showCode, setShowCode] = useState(false);
  const theme = useTheme();
  return (
    <main
      className={`flex flex-col h-auto lg:bg-bg-main min-h-screen lg:min-h-0 lg:h-screen ${publicSans.className} bg-cover bg-center overflow-hidden`}
    >
      <TopNav />
      <div
        className={`flex flex-col flex-1 xl:px-6 lg:px-10 lg:py-6 w-full max-w-screen-2xl mx-auto overflow-hidden overflow-x-hidden ${inter.className} lg:overflow-hidden mt-24 lg:mt-0`}
      >
        <div className="flex flex-1 justify-center gap-6 overflow-hidden">
          <ConfigurationWrapper />
          <div
            className={cn(
              "flex flex-col lg:flex-1 relative border border-border rounded-lg overflow-hidden overflow-y-auto scrollbar-none",
              theme === "dark" ? "bg-demo-bg-darkmode" : "bg-white",
              showCode && "bg-white"
            )}
          >
            <ContentNav showCode={showCode} setShowCode={setShowCode} />
            <ContentWrapper showCode={showCode} />
          </div>
        </div>
      </div>
    </main>
  );
}

const RenderContent = ({
  user,
  isEOAUser,
  isSmartWallet,
}: {
  user: boolean;
  isEOAUser: boolean;
  isSmartWallet: boolean;
}) => {
  if (!user) {
    return <MobileSplashPage />;
  }
  if (isEOAUser) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="border-border border radius-2 px-6 py-6  bg-bg-surface-default">
          <RenderUserConnectionAvatar />
          <div className="pt-6 max-w-96 mx-auto">
            <EOAPostLoginContents />
            <EOAPostLoginActions />
          </div>
        </div>
      </div>
    );
  }
  if (isSmartWallet) {
    return <MintCard />;
  }
  return <Wrapper7702 />;
};
