import { cn } from "@/lib/utils";
import { CodePreview } from "./CodePreview";
import {
  AuthCard,
  useUser,
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
          showCode && "hidden"
        )}
      >
        <RenderContent />
      </div>

      {showCode && <CodePreview />}
    </>
  );
}
const RenderContent = () => {
  const user = useUser();
  const { authStep } = useAuthContext();
  const [showAuthCard, setShowAuthCard] = useState(() => !user);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");

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
          <div
            className="radius bg-bg-surface-default overflow-hidden"
            style={{
              boxShadow:
                "0px 290px 81px 0px rgba(0, 0, 0, 0.00), 0px 186px 74px 0px rgba(0, 0, 0, 0.01), 0px 104px 63px 0px rgba(0, 0, 0, 0.05), 0px 46px 46px 0px rgba(0, 0, 0, 0.09), 0px 12px 26px 0px rgba(0, 0, 0, 0.10)",
            }}
          >
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (!phoneNumber.trim()) return;
                      authenticate({ type: "sms", phone: `+1${phoneNumber}` });
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Send SMS
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-medium">
                  Verification Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="otp"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (!otpCode.trim()) return;
                      authenticate({ type: "otp", otpCode: otpCode });
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
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
