"use client";

import { Authentication } from "@/components/configuration/Authentication";
import { Styling } from "@/components/configuration/Styling";
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

  return (
    <main
      className={`flex bg-gray-50 flex-col h-screen ${publicSans.className}`}
    >
      <TopNav />
      <div
        className={`flex flex-col flex-1 px-4 md:px-6 lg:px-10 py-4 md:py-6 w-full max-w-screen-2xl mx-auto overflow-hidden ${inter.className}`}
      >
        <div className="flex flex-1 gap-6 overflow-hidden">
          <div className="hidden lg:flex flex-col basis-0 flex-1 bg-white border border-border rounded-lg p-6 overflow-y-auto scrollbar-none gap-10">
            <Authentication />
            <Styling />
          </div>

          <div className="flex flex-col flex-[2] basis-0 relative bg-white border border-border rounded-lg overflow-hidden">
            {/* Code toggle header */}
            <div className="sticky h-7 top-4 flex items-center justify-end pr-4 gap-2">
              <div className="bg-purple-50 text-[#8B5CF6] px-2 py-1 rounded text-xs font-semibold">
                Code preview
              </div>
              <CodePreviewSwitch
                checked={showCode}
                onCheckedChange={setShowCode}
              />
            </div>

            {/* Don't unmount when showing code preview so that the auth card retains its state */}
            <AuthCardWrapper className={showCode ? "hidden" : "-mt-7"} />
            {showCode && <CodePreview className="-mt-7" />}
          </div>
        </div>
      </div>
    </main>
  );
}
