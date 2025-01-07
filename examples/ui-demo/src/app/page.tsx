"use client";

import { Authentication } from "@/components/configuration/Authentication";
import { Styling } from "@/components/configuration/Styling";
import { MobileSplashPage } from "@/components/preview/MobileSplashPage";
import {
  EOAPostLoginActions,
  EOAPostLoginContents,
} from "@/components/shared/eoa-post-login/EOAPostLoginContents";
import ExternalLink from "@/components/shared/ExternalLink";
import { MintCard } from "@/components/shared/mint-card/MintCard";
import { RenderUserConnectionAvatar } from "@/components/shared/user-connection-avatar/RenderUserConnectionAvatar";
import { cn } from "@/lib/utils";
import { Metrics } from "@/metrics";
import { useTheme } from "@/state/useTheme";
import { useUser } from "@account-kit/react";
import { Inter, Public_Sans } from "next/font/google";
import { useState } from "react";
import { AuthCardWrapper } from "../components/preview/AuthCardWrapper";
import { CodePreview } from "../components/preview/CodePreview";
import { CodePreviewSwitch } from "../components/shared/CodePreviewSwitch";
import { TopNav } from "../components/topnav/TopNav";
import { Configuration } from "@/components/configuration/Configuration";
import { Wrapper7702 } from "@/components/shared/7702/Wrapper";
import { useConfigStore } from "@/state";
import { WalletTypes } from "./config";

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
  const theme = useTheme();
  const isEOAUser = user?.type === "eoa";
  const { walletType } = useConfigStore();

  return (
    <main
      className={`flex flex-col h-auto lg:bg-bg-main min-h-screen lg:min-h-0 lg:h-screen ${publicSans.className} bg-cover bg-center overflow-hidden`}
    >
      <TopNav />
      <div
        className={`flex flex-col flex-1 xl:px-6 lg:px-10 lg:py-6 w-full max-w-screen-2xl mx-auto overflow-hidden overflow-x-hidden ${inter.className} lg:overflow-hidden`}
      >
        <div className="hidden lg:flex flex-1 gap-6 overflow-hidden">
          <div className=" flex-col w-[272px] lg:w-[392px] bg-white border border-border rounded-lg p-6 overflow-y-auto scrollbar-none gap-10">
            <Configuration />
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
                "absolute top-6 right-6 z-10",
                showCode && "hidden",
                user && "hidden"
              )}
            >
              <CodePreviewSwitch
                checked={showCode}
                onCheckedChange={setShowCode}
              />
            </div>
            <div
              className={cn(
                ` w-full p-6 top-0 left-0 border-b border-border z-10`,
                !user && !showCode && "hidden",
                showCode ? "sticky" : "absolute",
                theme === "dark"
                  ? showCode
                    ? "bg-white"
                    : "bg-demo-bg-darkmode"
                  : "bg-white"
              )}
            >
              <div
                className={cn(
                  "flex justify-between items-start",

                  !showCode && !user && "justify-end"
                )}
              >
                {!showCode && user && <RenderUserConnectionAvatar />}
                {showCode && (
                  <div className="font-semibold text-foreground text-xl">
                    Export configuration
                  </div>
                )}

                <CodePreviewSwitch
                  checked={showCode}
                  onCheckedChange={setShowCode}
                />
              </div>
              {showCode && (
                <p className="text-sm text-demo-fg-secondary max-w-[85%]">
                  To get started, simply paste the below code into your
                  environment. You&apos;ll need to add your Alchemy API key and
                  Gas Policy ID.{" "}
                  <ExternalLink
                    onClick={() =>
                      Metrics.trackEvent({
                        name: "codepreview_theme_customization_clicked",
                      })
                    }
                    href="https://accountkit.alchemy.com/react/customization/theme"
                    className="font-semibold text-blue-600"
                  >
                    Fully customize styling here.
                  </ExternalLink>
                </p>
              )}
            </div>

            {/* Don't unmount when showing code preview so that the auth card retains its state */}
            <AuthCardWrapper
              className={cn(showCode && "hidden", !user ? "mt-0" : "mt-24")}
            />
            {showCode && <CodePreview />}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-24 overflow-auto scrollbar-none lg:hidden">
          <RenderContent
            user={!!user}
            isEOAUser={isEOAUser}
            isSmartWallet={walletType === WalletTypes.smart}
          />
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
