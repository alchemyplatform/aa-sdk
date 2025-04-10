import { Dialog, useMFA } from "@account-kit/react";
import { useEffect, useState, useCallback } from "react";
import { XIcon } from "../../icons/x";
import { AlchemyLogo } from "../../icons/alchemy";
import { BackArrow } from "../../icons/BackArrow";

import { Button } from "../../small-cards/Button";

import { OTPCodeType, initialOTPValue } from "../../ui/OTPInput";

import { MFAModalStart } from "./stages/MFAModalStart";
import { MFAModalQR } from "./stages/MFAModalQR";
import { MFAModalCode } from "./stages/MFAModalCode";
import { MFAModalVerify } from "./stages/MFAModalVerify";
import { MFAModalSuccess } from "./stages/MFAModalSuccess";
import { DynamicHeight } from "@/components/ui/dynamic-height";

export type MFAStage = "start" | "qr" | "code" | "verify" | "success";

type MFAModalProps = {
  isMfaActive?: boolean;
  onMfaEnabled?: () => void;
  onMfaRemoved?: () => void;
  isLoadingClient?: boolean;
};

export function MFAModal({
  isMfaActive = false,
  onMfaEnabled,
  onMfaRemoved,
  isLoadingClient,
}: MFAModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stage, setStage] = useState<MFAStage>("start");
  const [otp, setOTP] = useState<OTPCodeType>(initialOTPValue);
  const [totpUrl, setTotpUrl] = useState<string | null>(null);
  const [mfaKey, setMfaKey] = useState<string | null>(null);
  const [multiFactorId, setMultiFactorId] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [systemError, setSystemError] = useState(false);

  const { addMFA, verifyMFA, removeMFA, getMFAFactors, isReady } = useMFA();

  const handleClose = () => setIsModalOpen(false);

  const handleInitMFASetup = async () => {
    setStage("start");
    setOTP(initialOTPValue);
    setTotpUrl(null);
    setMultiFactorId(null);
    setOtpError(null);
    setSystemError(false);
    setIsModalOpen(true);
  };

  const resetModalState = useCallback(() => {
    setIsModalOpen(false);
    setStage("start");
    setOTP(initialOTPValue);
    setTotpUrl(null);
    setMultiFactorId(null);
    setOtpError(null);
    setSystemError(false);
  }, []);

  const startMFASetup = useCallback(() => {
    if (!isReady) {
      setSystemError(true);
      console.error("MFA not available");
      return;
    }

    addMFA.mutate(
      { multiFactorType: "totp" },
      {
        onSuccess: (result) => {
          if (result?.multiFactorTotpUrl) {
            setTotpUrl(result.multiFactorTotpUrl);
            const url = new URL(result.multiFactorTotpUrl);
            const secret = new URLSearchParams(url.search).get("secret");
            setMfaKey(secret);
            setMultiFactorId(result.multiFactorId);
            setStage("qr");
          } else {
            setSystemError(true);
            console.error("Failed to generate MFA setup");
          }
        },
        onError: (error) => {
          console.error("Error adding MFA:", error);
          setSystemError(true);
        },
      }
    );
  }, [addMFA, isReady]);

  const verifyTOTP = useCallback(() => {
    if (!multiFactorId || !otp.join("")) {
      setSystemError(true);
      console.error("Missing required information for verification");
      return;
    }

    verifyMFA.mutate(
      {
        multiFactorId: multiFactorId,
        multiFactorCode: otp.join(""),
      },
      {
        onSuccess: () => {
          setStage("success");
          onMfaEnabled?.();
        },
        onError: (error) => {
          console.error("Error verifying MFA:", error);
          setOtpError("The code you entered is incorrect");
          setOTP(initialOTPValue);
        },
      }
    );
  }, [multiFactorId, onMfaEnabled, otp, verifyMFA]);

  const handleRemoveMFA = useCallback(() => {
    if (!isReady) {
      setSystemError(true);
      console.error("MFA not available");
      return;
    }

    getMFAFactors.mutate(undefined, {
      onSuccess: (result) => {
        const factorId = result?.multiFactors?.[0]?.multiFactorId;

        if (!factorId) {
          setSystemError(true);
          console.error("No MFA factor ID found");
          return;
        }

        removeMFA.mutate(
          { multiFactorIds: [factorId] },
          {
            onSuccess: () => {
              onMfaRemoved?.();
              resetModalState();
            },
            onError: (error) => {
              console.error("Error removing MFA:", error);
              setSystemError(true);
            },
          }
        );
      },
      onError: (error) => {
        console.error("Error getting MFA factors:", error);
        setSystemError(true);
      },
    });
  }, [getMFAFactors, isReady, onMfaRemoved, removeMFA, resetModalState]);

  useEffect(() => {
    if (otp.every((value) => value !== "")) {
      verifyTOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const renderContent = useCallback(() => {
    switch (stage) {
      case "start":
        return (
          <MFAModalStart
            startMFASetup={startMFASetup}
            isLoading={addMFA.isPending}
          />
        );
      case "qr":
        return (
          <MFAModalQR
            totpUrl={totpUrl}
            isLoading={addMFA.isPending}
            setStage={setStage}
          />
        );
      case "code":
        return <MFAModalCode setStage={setStage} mfaKey={mfaKey} />;
      case "verify":
        return (
          <MFAModalVerify
            otp={otp}
            setOTP={setOTP}
            setError={setOtpError}
            error={otpError}
            isLoading={verifyMFA.isPending}
          />
        );
      case "success":
        return <MFAModalSuccess resetModalState={resetModalState} />;
    }
  }, [
    stage,
    startMFASetup,
    addMFA.isPending,
    verifyMFA.isPending,
    totpUrl,
    mfaKey,
    otp,
    otpError,
    resetModalState,
  ]);

  const isLoading =
    addMFA.isPending ||
    verifyMFA.isPending ||
    removeMFA.isPending ||
    getMFAFactors.isPending;
  const handleBack = () => {
    setStage("qr");
  };
  const canGoBack = stage === "verify" || stage === "code";

  return (
    <>
      {isMfaActive ? (
        <Button
          className="mt-auto"
          onClick={handleRemoveMFA}
          disabled={
            removeMFA.isPending || getMFAFactors.isPending || isLoadingClient
          }
        >
          {removeMFA.isPending || getMFAFactors.isPending
            ? "Removing..."
            : "Remove MFA"}
        </Button>
      ) : (
        <Button
          className="mt-auto"
          onClick={handleInitMFASetup}
          disabled={isLoadingClient || isLoading}
        >
          {isLoadingClient ? "Loading..." : "Enable Authenticator App"}
        </Button>
      )}
      <Dialog isOpen={isModalOpen} onClose={handleClose}>
        <div
          className={`akui-modal md:w-[400px] rounded-lg overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <DynamicHeight>
            <div className="p-6 flex flex-col items-center transition-all duration-300 ease-in-out">
              <div className="flex flex-row-reverse justify-between w-full">
                <button
                  className="self-end text-fg-secondary w-[40px] h-[40px] flex items-center justify-center hover:bg-btn-secondary rounded-md"
                  onClick={handleClose}
                >
                  <XIcon className="w-[24px] h-[24px] lg:w-[16px] lg:h-[16px] stroke-fg-primary" />
                </button>
                {canGoBack && (
                  <button
                    onClick={handleBack}
                    className="text-fg-secondary w-[40px] h-[40px] flex items-center justify-center hover:bg-btn-secondary rounded-md"
                  >
                    <BackArrow className="w-[24px] h-[24px] lg:w-[16px] lg:h-[16px]" />
                  </button>
                )}
              </div>
              {renderContent()}
              {systemError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
                  Something went wrong.
                </div>
              )}
              <div className="flex flex-row gap-1 items-center h-[14px] text-fg-disabled">
                <span className="text-[11px] pt-[1px]">protected by</span>
                <AlchemyLogo className="fill-fg-disabled" />
              </div>
            </div>
          </DynamicHeight>
        </div>
      </Dialog>
    </>
  );
}
