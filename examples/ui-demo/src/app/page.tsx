"use client";

import { Public_Sans } from "next/font/google";

import {
  AuthCard,
  AuthType,
  DemoSet,
  useAuthModal,
  useAuthError,
  useUser,
} from "@alchemy/aa-alchemy/react";
// eslint-disable-next-line import/extensions
import { useLogout } from "@alchemy/aa-alchemy/react";
import { useMemo } from "react";
import { TopNav } from "../components/topnav/TopNav";
import { Button } from "../components/shared/Button";
import { PhoneIcon } from "lucide-react";
import { ArrowUpRightIcon } from "../components/icons/arrow";
import { Configuration } from "../components/configuration";
import { useConfig } from "./state";

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  const { config } = useConfig();

  const sections = useMemo<AuthType[][]>(() => {
    const output = [];
    if (config.auth.showEmail) {
      output.push([{ type: "email" as const, hideButton: true }]);
    }

    output.push([{ type: "passkey" as const }]);

    return output;
  }, [config.auth]);

  return (
    <>
      <main
        className={`flex bg-gray-50 flex-col min-h-screen ${publicSans.className}`}
      >
        <TopNav />
        <div className="flex flex-col flex-1 px-10 py-6 gap-6 w-full max-w-screen-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-xl">Demo</h2>
            <div className="flex gap-4">
              <Button>
                Integration call
                <PhoneIcon className="ml-2 h-4 w-4" />
              </Button>
              <Button>
                Quickstart guide
                <ArrowUpRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 gap-6">
            <div className="flex flex-col flex-1 bg-white border border-static rounded-lg p-6">
              <Configuration />
            </div>
            <div
              className="flex-[2] bg-white border border-static rounded-lg flex flex-col justify-center items-center"
              style={{
                backgroundImage: "url(/images/grid.png)",
                backgroundSize: "100px",
                backgroundRepeat: "repeat",
              }}
            >
              <div className="flex flex-col gap-2 w-[368px]">
                <div className="modal bg-white shadow-md">
                  <AuthCard showNavigation sections={sections} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
