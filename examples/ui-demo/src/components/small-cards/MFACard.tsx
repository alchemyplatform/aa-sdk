import { useEffect, useState } from "react";
import { ThreeStarsIcon } from "../icons/three-stars";
import { MFAModal } from "../modals/MFA/MFAModal";
import { useMFA, useUser } from "@account-kit/react";
import { Card } from "./Card";

export function MFACard() {
  const [isMfaActive, setIsMfaActive] = useState(false);
  const { getMFAFactors, isReady } = useMFA();
  const user = useUser();
  const isPasskeyUser = !!user?.credentialId;

  useEffect(() => {
    if (isReady && !isPasskeyUser) {
      getMFAFactors.mutate(undefined, {
        onSuccess: (factors) => {
          setIsMfaActive(
            !!factors?.multiFactors && factors.multiFactors.length > 0
          );
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return (
    <Card
      imageSlot={
        <div className="w-full h-full bg-[#DCE9FF] flex justify-center items-center">
          <ThreeStarsIcon className="h-9 w-9 sm:h-[74px] sm:w-[74px] xl:h-[94px] xl:w-[94px]" />
        </div>
      }
      badgeSlot={
        <p className="px-2 py-1 font-semibold rounded-md text-xs text-[#7c3AED] bg-[#F3F3FF]">
          New!
        </p>
      }
      heading={
        <div className="flex items-center justify-between flex-col sm:flex-row">
          <h3 className="text-fg-primary xl:text-xl font-semibold mb-2 xl:mb-3 self-start">
            Multi-factor <br />
            Authentication
          </h3>
          {isMfaActive && (
            <span className="text-sm font-medium self-start sm:px-2 sm:py-0.5 rounded-full flex items-center gap-1 font-inter leading-[21px] tracking-normal">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              Active
            </span>
          )}
        </div>
      }
      content={
        <p className="text-fg-primary text-sm">
          Lock down your account with MFA. This requires downloading an auth app
          like Google Authenticator.
        </p>
      }
      buttons={
        isPasskeyUser ? (
          <p className="text-fg-secondary text-xs bg-bg-surface-inset py-2 px-3 rounded-md font-medium mt-auto">
            MFA is not supported when logged in using passkey.
          </p>
        ) : (
          <MFAModal
            isMfaActive={isMfaActive}
            onMfaEnabled={() => setIsMfaActive(true)}
            onMfaRemoved={() => setIsMfaActive(false)}
          />
        )
      }
    />
  );
}
