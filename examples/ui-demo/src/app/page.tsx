"use client";

import { Authentication } from "@/components/configuration/Authentication";
import { Styling } from "@/components/configuration/Styling";
import { Inter, Public_Sans } from "next/font/google";
import { useState } from "react";
import { AuthCardWrapper } from "../components/preview/AuthCardWrapper";
import { CodePreview } from "../components/preview/CodePreview";
import { CodePreviewSwitch } from "../components/shared/CodePreviewSwitch";
import { TopNav } from "../components/topnav/TopNav";
import { UserConnectionAvatarWithPopover } from "@/components/shared/user-connection-avatar/UserConnectionAvatarWithPopover";
import { useUser } from "@account-kit/react";
import { useConfig } from "./state";
import { MobileSplashPage } from "@/components/preview/MobileSplashPage";
import { useLogout } from "@account-kit/react";

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
  const { nftTransfered } = useConfig();
  const user = useUser();
  const { logout } = useLogout();
  return (
    <main
      className={`flex bg-gray-50 flex-col h-screen ${publicSans.className}`}
    >
      <TopNav />
      <div
        className={`flex flex-col flex-1 px-4 md:px-6 lg:px-10 py-4 md:py-6 w-full max-w-screen-2xl mx-auto overflow-visible overflow-x-hidden ${inter.className} md:overflow-hidden`}
      >
        <div className="flex flex-1 gap-6 overflow-hidden">
          <div className="hidden md:flex flex-col max-w-[392px] bg-white border border-border rounded-lg p-6 overflow-y-auto scrollbar-none gap-10">
            <Authentication />
            <Styling />
          </div>

          <div className="flex flex-col flex-[2] basis-0 relative bg-white border border-border rounded-lg overflow-hidden">
            {/* Code toggle header */}
            <div
              className={`absolute h-7 top-6 flex items-center left-6 right-6 ${
                !user || showCode ? "justify-end" : "justify-between"
              }  z-10`}
            >
              {!showCode && user && (
                <UserConnectionAvatarWithPopover
                  deploymentStatus={nftTransfered}
                />
              )}
              <div className="flex gap-2">
                <div className="bg-purple-50 text-[#8B5CF6] px-2 py-1 rounded text-xs font-semibold">
                  Code preview
                </div>
                <CodePreviewSwitch
                  checked={showCode}
                  onCheckedChange={setShowCode}
                />
              </div>
            </div>

            {/* Don't unmount when showing code preview so that the auth card retains its state */}
            <AuthCardWrapper className={showCode ? "hidden" : "mt-0"} />
            {showCode && <CodePreview />}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6 md:hidden">
          {/* 
					  	TEMPORARY: Adding a logout button so users can properly logout. 
						This will be removed once we add the mint functionality to mobile.
					 */}
          {!user ? (
            <MobileSplashPage />
          ) : (
            <button
              className="btn btn-secondary"
              onClick={() => {
                logout();
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
