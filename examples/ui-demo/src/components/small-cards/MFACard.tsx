import { useEffect, useState } from "react";
import { ThreeStarsIcon } from "../icons/three-stars";
import { MFAModal } from "../modals/MFA/MFAModal";
import { useMFA, useUser } from "@account-kit/react";
import { Card } from "./Card";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export function MFACard() {
  const [isMfaActive, setIsMfaActive] = useState(false);
  const { getMFAFactors, isReady } = useMFA();
  const user = useUser();
  const isPasskeyUser = user?.credentialId;

  useEffect(() => {
    // This requires a stamp, so don't automatically call it for a
    // passkey user, since stamping will require user approval.
    if (isReady && !isPasskeyUser && getMFAFactors.isIdle) {
      getMFAFactors.mutate(undefined, {
        onSuccess: (data) => {
          setIsMfaActive(!!data?.multiFactors && data.multiFactors.length > 0);
        },
      });
    }
  }, [getMFAFactors, isPasskeyUser, isReady]);

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
          {!!getMFAFactors.data && (
            <div className="text-sm font-medium self-start sm:px-2 sm:py-0.5 rounded-full flex items-center gap-1 font-inter leading-[21px] tracking-normal">
              <div
                className={cn(
                  "h-3 w-3 rounded-full bg-green-500",
                  isMfaActive ? "bg-green-500" : "bg-neutral-400/70"
                )}
              />
              {isMfaActive ? "Active" : "Inactive"}
            </div>
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
        !getMFAFactors.data ? (
          <Button
            className="mt-auto"
            onClick={() =>
              getMFAFactors.mutate(undefined, {
                onSuccess: (data) => {
                  setIsMfaActive(
                    !!data?.multiFactors && data.multiFactors.length > 0
                  );
                },
              })
            }
            disabled={!isReady || getMFAFactors.isPending}
          >
            Check MFA status
          </Button>
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
