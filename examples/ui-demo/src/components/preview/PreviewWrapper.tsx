import { cn } from "@/lib/utils";
import { CodePreview } from "./CodePreview";
import {
  AuthCard,
  useConnectedUser,
  useAuthContext,
  useAuthenticate,
} from "@account-kit/react";

import { MobileSplashPage } from "./MobileSplashPage";
import { EOAPostLogin } from "../eoa-post-login/EOAPostLogin";
import { useState, useEffect } from "react";
import { SmallCardsWrapper } from "../small-cards/Wrapper";

export function PreviewWrapper({ showCode }: { showCode: boolean }) {
  return (
    <>
      {/* Don't unmount when showing code preview so that the auth card retains its state */}
      <div
        className={cn(
          "flex flex-col flex-1 overflow-y-auto scrollbar-none relative p-3 lg:p-6 xl:py-0",
          showCode && "hidden",
        )}
      >
        <RenderContent />
      </div>

      {showCode && <CodePreview />}
    </>
  );
}
const RenderContent = () => {
  const user = useConnectedUser();
  const { authStep } = useAuthContext();
  const [showAuthCard, setShowAuthCard] = useState(() => !user);

  useEffect(() => {
    // Show auth card for unauthenticated users
    if (!user) {
      setShowAuthCard(true);

      // Get auth details for authenticated users
    } else if (!!user && ["complete", "initial"].includes(authStep.type)) {
      setShowAuthCard(false);
    }
  }, [authStep.type, user]);

  const { authenticate } = useAuthenticate();

  if (showAuthCard) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <div className="hidden lg:flex flex-col gap-2 w-[368px]">
          {/* TODO(jh): remove these buttons after dogfooding */}
          <div className="flex gap-3 justify-center p-2">
            <button
              className="bg-blue-200 rounded-md p-2"
              onClick={async () => {
                const input = window.prompt("Enter phone:");
                authenticate({
                  type: "sms",
                  phone: input!,
                });
              }}
            >
              Send login SMS
            </button>
            <button
              className="bg-blue-200 rounded-md p-2"
              onClick={async () => {
                const input = window.prompt("Enter phone:");
                authenticate({
                  type: "otp",
                  otpCode: input!,
                });
              }}
            >
              Enter SMS code
            </button>
          </div>
          <div
            className="radius bg-bg-surface-default overflow-hidden"
            style={{
              boxShadow:
                "0px 290px 81px 0px rgba(0, 0, 0, 0.00), 0px 186px 74px 0px rgba(0, 0, 0, 0.01), 0px 104px 63px 0px rgba(0, 0, 0, 0.05), 0px 46px 46px 0px rgba(0, 0, 0, 0.09), 0px 12px 26px 0px rgba(0, 0, 0, 0.10)",
            }}
          >
            <AuthCard />
          </div>
        </div>
        <MobileSplashPage />
      </div>
    );
  }

  const isEOAUser = user?.type === "eoa";

  if (isEOAUser) {
    return (
      <div className="flex flex-1 justify-center items-start">
        <div className="h-full w-full pb-10 pt-5 flex flex-col lg:justify-center items-center">
          <EOAPostLogin />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center items-start">
      <SmallCardsWrapper />
    </div>
  );
};
