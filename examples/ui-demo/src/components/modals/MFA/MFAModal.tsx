import { Dialog } from "@account-kit/react";
import { useEffect, useState, useCallback } from "react";
import { XIcon } from "../../icons/x";
import { AlchemyLogo } from "../../icons/alchemy";

import { Button } from "../../small-cards/Button";

import { OTPCodeType, initialOTPValue } from "../../ui/OTPInput";
import { useSigner } from "@account-kit/react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [systemError, setSystemError] = useState(false);
  const signer = useSigner();
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

  const startMFASetup = useCallback(async () => {
    if (!signer) {
      setSystemError(true);
      console.error("Signer not available");
      return;
    }
    setIsLoading(true);
    try {
      const result = await signer.inner.addMfa({
        multiFactorType: "totp",
      });

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
    } catch (error) {
      console.error("Error adding MFA:", error);
      setSystemError(true);
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  const verifyTOTP = useCallback(async () => {
    if (!multiFactorId || !otp.join("") || !signer) {
      setSystemError(true);
      console.error("Missing required information for verification");
      return;
    }

    setIsLoading(true);
    try {
      await signer.inner.verifyMfa({
        multiFactorId: multiFactorId,
        multiFactorCode: otp.join(""),
      });

      setStage("success");
      onMfaEnabled?.();
    } catch (error) {
      console.error("Error verifying MFA:", error);
      setOtpError("The code you entered is incorrect");
      setOTP(initialOTPValue);
    } finally {
      setIsLoading(false);
    }
  }, [multiFactorId, onMfaEnabled, otp, signer]);

  const removeMFA = useCallback(async () => {
    if (!signer) {
      setSystemError(true);
      console.error("Signer not available");
      return;
    }
    setIsRemoving(true);
    try {
      const factors = await signer.inner.getMfaFactors();
      const factorId = factors?.multiFactors?.[0]?.multiFactorId;

      if (!factorId) {
        setSystemError(true);
        console.error("No MFA factor ID found");
        return;
      }

      await signer.inner.removeMfa({
        multiFactorIds: [factorId],
      });

      onMfaRemoved?.();
      resetModalState();
    } catch (error) {
      console.error("Error removing MFA:", error);
      setSystemError(true);
    } finally {
      setIsRemoving(false);
    }
  }, [onMfaRemoved, resetModalState, signer]);

  useEffect(() => {
    if (otp.every((value) => value !== "")) {
      verifyTOTP();
    }
  }, [otp, verifyTOTP]);

  const renderContent = useCallback(() => {
    switch (stage) {
      case "start":
        return (
          <MFAModalStart startMFASetup={startMFASetup} isLoading={isLoading} />
        );
      case "qr":
        return (
          <MFAModalQR
            totpUrl={totpUrl}
            isLoading={isLoading}
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
            isLoading={isLoading}
          />
        );
      case "success":
        return <MFAModalSuccess resetModalState={resetModalState} />;
    }
  }, [
    stage,
    startMFASetup,
    isLoading,
    totpUrl,
    mfaKey,
    otp,
    otpError,
    resetModalState,
  ]);

  return (
    <>
      {isMfaActive ? (
        <Button onClick={removeMFA} disabled={isRemoving || isLoadingClient}>
          {isRemoving ? "Removing..." : "Remove MFA"}
        </Button>
      ) : (
        <Button onClick={handleInitMFASetup} disabled={isLoadingClient}>
          {isLoadingClient ? "Loading..." : "Enable Authenticator App"}
        </Button>
      )}
      <Dialog isOpen={isModalOpen} onClose={handleClose}>
        <div
          className={`akui-modal md:w-[400px] rounded-lg overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <DynamicHeight>
            <div className="p-6 flex flex-col items-center transition-all duration-300 ease-in-out">
              <button className="self-end" onClick={handleClose}>
                <XIcon
                  height="20px"
                  width="20px"
                  className="stroke-fg-primary"
                />
              </button>
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
