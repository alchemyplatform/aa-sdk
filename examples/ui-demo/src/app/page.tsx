"use client";

import { Authentication } from "@/components/configuration/Authentication";
import { Styling } from "@/components/configuration/Styling";
import { MobileSplashPage } from "@/components/preview/MobileSplashPage";
import {
  EOAPostLoginActions,
  EOAPostLoginContents,
} from "@/components/shared/eoa-post-login/EOAPostLoginContents";
import { MintCard } from "@/components/shared/mint-card/MintCard";
import { RenderUserConnectionAvatar } from "@/components/shared/user-connection-avatar/RenderUserConnectionAvatar";
import { cn } from "@/lib/utils";
import { useConfig } from "@/state";
import { useUser } from "@account-kit/react";
import { Inter, Public_Sans } from "next/font/google";
import { useState } from "react";
import { AuthCardWrapper } from "../components/preview/AuthCardWrapper";
import { CodePreview } from "../components/preview/CodePreview";
import { CodePreviewSwitch } from "../components/shared/CodePreviewSwitch";
import { TopNav } from "../components/topnav/TopNav";

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
  const user = useUser();
  const { config } = useConfig();
  const isEOAUser = user?.type === "eoa";
  return (
    <main
      className={`flex flex-col h-screen bg-bg-main ${publicSans.className} bg-cover bg-center`}
    >
      <TopNav />
      <div
        className={`flex flex-col flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-6 w-full max-w-screen-2xl mx-auto overflow-visible overflow-x-hidden ${inter.className} sm:overflow-hidden`}
      >
        <div className="hidden sm:flex flex-1 gap-6 overflow-hidden">
          <div className=" flex-col w-[272px] md:w-[392px] bg-white border border-border rounded-lg p-6 overflow-y-auto scrollbar-none gap-10">
            <Authentication />
            <Styling />
          </div>

          <div
            className={
              "flex flex-col flex-[2] basis-0 relative bg-white border border-border rounded-lg overflow-hidden overflow-y-auto scrollbar-none"
            }
          >
            {/* Code toggle header */}
            <div
              className={cn(
                `absolute h-[85px] w-full p-6 top-0 flex items-center left-0 border-b border-border z-10`,
                !user && !showCode && "border-[transparent]",
                !user || showCode ? "justify-end" : "justify-between",
                config.ui.theme === "dark"
                  ? showCode
                    ? "bg-white"
                    : "bg-[#4D4D4D]"
                  : "bg-white"
              )}
            >
              {!showCode && user && <RenderUserConnectionAvatar />}
              <div className="flex gap-2 items-center">
                <div
                  className={cn(
                    "px-2 py-1 h-5 rounded text-xs font-semibold hidden lg:flex items-center justify-center ",
                    showCode
                      ? "bg-[#F3F3FF] text-[#8B5CF6]"
                      : "bg-[#EFF4F9] text-[#374151]"
                  )}
                >
                  Code preview
                </div>
                <CodePreviewSwitch
                  checked={showCode}
                  onCheckedChange={setShowCode}
                />
              </div>
            </div>

            {/* Don't unmount when showing code preview so that the auth card retains its state */}
            <AuthCardWrapper
              className={cn(
                showCode && "hidden",
                "mt-0 xl:pt-0",
                !user ? "md:pt-0" : "md:pt-[85px]"
              )}
            />
            {showCode && <CodePreview className="pt-[105px]" />}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6 sm:hidden">
          {!user && <MobileSplashPage />}
          {isEOAUser && (
            <div className="flex flex-1 flex-col">
              <div className="border-border border radius-2 px-6 py-6">
                <RenderUserConnectionAvatar />
                <div className="pt-6">
                  <EOAPostLoginContents />
                </div>
              </div>
              <div className="mt-auto mb-5 pt-10">
                <EOAPostLoginActions />
              </div>
            </div>
          )}
          {user && !isEOAUser && <MintCard />}
        </div>
      </div>
    </main>
  );
}
