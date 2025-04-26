"use client";

import { ConfigurationSidebarWrapper } from "@/components/configuration/ConfigurationSidebarWrapper";
import { Inter, Public_Sans } from "next/font/google";
import { useState } from "react";
import { TopNav } from "../components/topnav/TopNav";
import { PreviewNav } from "@/components/preview/PreviewNav";
import { PreviewWrapper } from "@/components/preview/PreviewWrapper";
import { cn } from "@/lib/utils";
import { useTheme } from "@/state/useTheme";
import { useUser } from "@account-kit/react";
import { Viewport } from "@radix-ui/react-toast";
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
  const user = useUser();
  return (
    <main
      className={`flex flex-col h-auto lg:bg-bg-main min-h-screen lg:min-h-0 lg:h-screen ${publicSans.className} bg-cover bg-center overflow-hidden`}
    >
      <TopNav />
      <div
        className={`flex flex-col flex-1 xl:px-6 lg:px-10 lg:py-6 w-full max-w-screen-2xl mx-auto overflow-hidden overflow-x-hidden ${inter.className} lg:overflow-hidden mt-[74px] lg:mt-0`}
      >
        <div className="flex flex-1 justify-center gap-6 overflow-hidden">
          <ConfigurationSidebarWrapper />
          <div
            className={cn(
              "flex flex-col lg:flex-1 relative border border-border rounded-lg overflow-hidden overflow-y-auto scrollbar-none mb-6 lg:mb-0 w-full lg:w-auto m-6 lg:m-0",
              theme === "dark" ? "bg-demo-bg-darkmode" : "bg-white",
              showCode && "bg-white",
              !user && "border-none lg:border-solid"
            )}
          >
            <PreviewNav showCode={showCode} setShowCode={setShowCode} />
            <PreviewWrapper showCode={showCode} />
            {/* Toast viewport */}
            <Viewport className="absolute lg:bottom-10 lg:right-10 bottom-10 right-1/2 translate-x-1/2 lg:translate-x-0 z-50 outline-none" />
          </div>
        </div>
      </div>
    </main>
  );
}
