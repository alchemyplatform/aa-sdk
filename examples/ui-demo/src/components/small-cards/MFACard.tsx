import { useEffect, useState } from "react";
import { ThreeStarsIcon } from "../icons/three-stars";
import { MFAModal } from "../modals/MFAModal";
import { useSmartAccountClient } from "@account-kit/react";
import { useConfigStore } from "@/state";

export function MFACard() {
  const { accountMode } = useConfigStore();
  const [isMfaActive, setIsMfaActive] = useState(false);
  const { client, isLoadingClient } = useSmartAccountClient({
    type: "ModularAccountV2",
    accountParams: {
      mode: accountMode,
    },
  });

  const checkMfaStatus = async () => {
    try {
      const signer = await client?.account.getSigner();
      const factors = await signer?.inner.getMfaFactors();

      setIsMfaActive(
        !!factors?.multiFactors && factors.multiFactors.length > 0
      );
    } catch (error) {
      console.error("Error checking MFA status:", error);
    }
  };

  useEffect(() => {
    if (client && !isLoadingClient) {
      checkMfaStatus();
    }
  }, [client, isLoadingClient]);

  return (
    <div className="bg-bg-surface-default rounded-lg p-4 xl:p-6 w-full xl:w-[326px] xl:h-[500px] flex flex-col justify-between shadow-smallCard min-h-[220px]">
      <div className="flex xl:flex-col gap-4">
        <div className="flex-shrink-0 bg-[#DCE9FF] rounded-xl sm:mb-3 xl:mb-0 flex justify-center items-center relative h-[67px] w-[60px] sm:h-[154px] sm:w-[140px] xl:h-[222px] xl:w-full">
          <ThreeStarsIcon className="h-9 w-9 sm:h-[74px] sm:w-[74px] xl:h-[94px] xl:w-[94px]" />
        </div>
        <div className="w-full mb-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-fg-primary xl:text-xl font-semibold">
              Multi-factor <br />
              Authentication
            </h3>
            {isMfaActive && (
              <span className="text-sm font-medium self-start px-2 py-0.5 rounded-full flex items-center gap-1 font-inter leading-[21px] tracking-normal">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                Active
              </span>
            )}
          </div>
          <p className="text-fg-primary text-sm">
            Lock down your account with MFA. This requires downloading an auth
            app like Google Authenticator.
          </p>
        </div>
      </div>
      <MFAModal
        isMfaActive={isMfaActive}
        onMfaEnabled={() => setIsMfaActive(true)}
        onMfaRemoved={() => setIsMfaActive(false)}
        isLoadingClient={isLoadingClient}
      />
    </div>
  );
}
