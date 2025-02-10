import { cn } from "@/lib/utils";
import { CodePreview } from "./CodePreview";
import {
  AuthCard,
  useUser,
  useAuthContext,
  useChain,
} from "@account-kit/react";

import { MobileSplashPage } from "./MobileSplashPage";
import { EOAPostLogin } from "../eoa-post-login/EOAPostLogin";
import { useState, useEffect } from "react";
import { MintCardDefault, MintCard7702 } from "../small-cards/MintCard";
import { TransactionsCard } from "../small-cards/TransactionsCard";
import { useConfigStore } from "@/state";
import { WalletTypes } from "@/app/config";
import { arbitrumSepolia } from "@account-kit/infra";
import { odysseyTestnet } from "@/hooks/7702/transportSetup";

export function PreviewWrapper({ showCode }: { showCode: boolean }) {
  return (
    <>
      {/* Don't unmount when showing code preview so that the auth card retains its state */}
      <div
        className={cn(
          "flex flex-col flex-1 overflow-y-auto scrollbar-none relative lg:p-6",
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

  return <SmallCards />;
};

const SmallCards = () => {
  const { walletType } = useConfigStore(({ walletType }) => ({ walletType }));

  const chain =
    walletType === WalletTypes.smart ? arbitrumSepolia : odysseyTestnet;

  const { chain: activeChain, setChain, isSettingChain } = useChain();

  useEffect(() => {
    console.log({ have: activeChain.name, want: chain.name });
    if (isSettingChain || chain.id === activeChain.id) return;
    console.log(`switching to ${chain.name}`);
    setChain({ chain });
  }, [activeChain, chain, isSettingChain, setChain]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:mt-6 items-center p-6">
      {walletType === WalletTypes.smart ? (
        <>
          <MintCardDefault />
          {/* TODO(jh): enable this after minting is working */}
          {/* <TransactionsCard /> */}
        </>
      ) : (
        <>
          <MintCard7702 />
          {/* TODO(jh): enable this after minting is working */}
          {/* <TransactionsCard /> */}
        </>
      )}
    </div>
  );
};
