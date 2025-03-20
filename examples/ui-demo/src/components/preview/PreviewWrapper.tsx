import { cn } from "@/lib/utils";
import { CodePreview } from "./CodePreview";
import { AuthCard, useUser, useAuthContext } from "@account-kit/react";

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
          "flex flex-col flex-1 overflow-y-auto scrollbar-none relative p-3 lg:p-6",
          showCode && "hidden"
        )}
      >
        <div className="flex flex-1 justify-center items-start lg:items-center ">
          <RenderContent />
        </div>
      </div>

      {showCode && <CodePreview />}
    </>
  );
}
const RenderContent = () => {
  const user = useUser();
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

  if (showAuthCard) {
    return (
      <>
        <div className="hidden lg:flex flex-col gap-2 w-[368px]">
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
      </>
    );
  }

  const isEOAUser = user?.type === "eoa";

  if (isEOAUser) {
    return (
      <div className="h-full w-full pb-10 pt-5 flex flex-col lg:justify-center items-center">
        <EOAPostLogin />
      </div>
    );
  }

  return <SmallCardsWrapper />;
};
