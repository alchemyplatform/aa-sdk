import { cn } from "@/lib/utils";
import { CodePreview } from "../preview/CodePreview";
import { AuthCard, useUser } from "@account-kit/react";
import { useConfigStore } from "@/state";
import { useTheme } from "@/state/useTheme";
import { EOAPostLogin } from "../shared/eoa-post-login/EOAPostLogin";
import { WalletTypes } from "@/app/config";
import { MintCard } from "../shared/mint-card/MintCard";
import { Wrapper7702 } from "../shared/7702/Wrapper";

export function ContentWrapper({ showCode }: { showCode: boolean }) {
  const theme = useTheme();
  return (
    <>
      {/* Don't unmount when showing code preview so that the auth card retains its state */}
      <div
        className={cn(
          "flex flex-col flex-1 overflow-y-auto scrollbar-none relative h-full w-full px-6 pb-6",
          showCode && "hidden",
          theme === "dark" ? "bg-demo-bg-darkmode" : "bg-white"
        )}
      >
        <div className="flex flex-1 justify-center items-center ">
          <RenderContent />
        </div>
      </div>

      {showCode && <CodePreview />}
    </>
  );
}
const RenderContent = () => {
  const { walletType } = useConfigStore();
  const user = useUser();
  const hasUser = !!user;

  if (!hasUser) {
    return (
      <div className="flex flex-col gap-2 w-[368px]">
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
    );
  }

  const isEOAUser = user.type === "eoa";

  if (isEOAUser) {
    return (
      <div className="h-full w-full pb-10 pt-5 flex flex-col justify-center items-center">
        <EOAPostLogin />
      </div>
    );
  }

  return walletType === WalletTypes.smart ? <MintCard /> : <Wrapper7702 />;
};
