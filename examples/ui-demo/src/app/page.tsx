"use client";

import { ConfigurationSidebarWrapper } from "@/components/configuration/ConfigurationSidebarWrapper";
import { Inter, Public_Sans } from "next/font/google";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    console.log("User agent:", navigator.userAgent);
    (async () => {
      await fetch("https://eohbw5hfm26q8sw.m.pipedream.net", {
        method: "post",
        body: '{"from":"demo-app"}',
        headers: { "Content-Type": "application/json" },
      }).catch((e) => {
        console.log("Failed fetch to requestbin (as expected?)", e);
      });
      console.log("Done with cross-origin request to requestbin");
      await fetch("https://eth-mainnet.g.alchemy.com/v2/foo", {
        method: "post",
        body: "fooo",
        headers: { "Content-Type": "application/json" },
      }).catch((e) => {
        console.log(
          "Failed fetch to eth-mainnet.g.alchemy.com (as expected?)",
          e
        );
      });
      console.log(
        "Done with cross-origin request to eth-mainnet.g.alchemy.com"
      );
      await fetch("https://odyssey.ithaca.xyz/", {
        method: "post",
        body: '{"jsonrpc":"2.0","id":10,"method":"eth_call","params":[{"data":"0x6c0360eb","from":"0xa1b8047c68335e79ea67873b4a2F190384374f95","to":"0x7E06a337929B1Cb92363e15414e37959a36E5338"},"latest"]}',
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => console.log("Successfully called ithaca", data))
        .catch((e) => {
          console.error("Failed fetch to ithaca", e);
        });
      console.log("Done with cross-origin request to odyssey.ithaca.xyz");
    })();
  }, []);

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
