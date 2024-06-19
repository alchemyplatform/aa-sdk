"use client";

import { Public_Sans, Inter } from "next/font/google";

import { useState } from "react";
import { TopNav } from "../components/topnav/TopNav";
import { Button } from "../components/shared/Button";
import { PhoneIcon } from "lucide-react";
import { ArrowUpRightIcon } from "../components/icons/arrow";
import { Configuration } from "../components/configuration";
import { CodePreview } from "../components/preview/CodePreview";
import { AuthCardWrapper } from "../components/preview/AuthCardWrapper";
import { CodePreviewSwitch } from "../components/shared/CodePreviewSwitch";

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
      className={`flex bg-gray-50 dark:bg-gray-800 flex-col h-screen ${publicSans.className}`}
    >
      <TopNav />
      <div
        className={`flex flex-col flex-1 px-10 py-6 gap-6 w-full max-w-screen-2xl mx-auto overflow-hidden ${inter.className}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl">Demo</h2>
          <div className="flex gap-4 text-secondary">
            <Button className="border border-gray-400">
              Integration call
              <PhoneIcon className="ml-2 h-4 w-4" />
            </Button>
            <Button className="border border-gray-400">
              Quickstart guide
              <ArrowUpRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          <div className="flex flex-col  basis-0 flex-1 bg-white border border-border rounded-lg p-6 overflow-y-scroll">
            <Configuration />
          </div>
          <div className="flex flex-col flex-[2] basis-0 relative bg-white border border-border rounded-lg">
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <div className="bg-purple-50 text-[#8B5CF6] px-2 py-1 rounded text-xs font-semibold">
                Configuration preview
              </div>
              <CodePreviewSwitch
                checked={showCode}
                onCheckedChange={setShowCode}
              />
            </div>
            {/* Don't unmount when showing code preview so that the auth card retains its state */}
            <AuthCardWrapper className={showCode ? "hidden" : ""} />
            {showCode && <CodePreview />}
          </div>
        </div>
      </div>
    </main>
  );
}
