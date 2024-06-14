"use client";

import { Public_Sans, Inter } from "next/font/google";

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

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  const { config } = useConfig();

  const sections = useMemo<AuthType[][]>(() => {
    const output = [];
    if (config.auth.showEmail) {
      output.push([{ type: "email" as const }]);
    }

    output.push([{ type: "passkey" as const }]);

    return output;
  }, [config.auth]);

  return (
    <main
      className={`flex bg-gray-50 flex-col h-screen ${publicSans.className}`}
    >
      <TopNav />
      <div
        className={`flex flex-col flex-1 px-10 py-6 gap-6 w-full max-w-screen-2xl mx-auto overflow-hidden ${inter.className}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl">Demo</h2>
          <div className="flex gap-4 text-fg-secondary">
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
          <div className="flex flex-col  basis-0 flex-1 bg-white border border-static rounded-lg p-6 overflow-y-scroll">
            <Configuration />
          </div>
          <div
            className="flex-[2] basis-0 bg-white border border-static rounded-lg flex flex-col justify-center items-center overflow-auto"
            style={{
              backgroundImage: "url(/images/grid.png)",
              backgroundSize: "100px",
              backgroundRepeat: "repeat",
            }}
          >
            <div className="flex flex-col gap-2 w-[368px]">
              <div className="modal bg-white shadow-md">
                <AuthCard
                  header={<AuthCardHeader />}
                  showSignInText
                  showNavigation
                  sections={sections}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AuthCardHeader() {
  const {
    config: {
      ui: { logoDark, logoLight, theme },
    },
  } = useConfig();

  const logo = theme === "dark" ? logoDark : logoLight;

  if (!logo) return null;

  return (
    <img style={{ height: "60px" }} src={logo.fileSrc} alt={logo.fileName} />
  );
}
