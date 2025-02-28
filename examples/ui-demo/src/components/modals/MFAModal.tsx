import { Dialog } from "@account-kit/react";
import { useEffect, useState } from "react";
import { XIcon } from "../icons/x";
import { QRCodeSVG } from "qrcode.react";
import { AlchemyLogo } from "../icons/alchemy";
import { AlchemyTwoToneLogo } from "../icons/alchemy-two-tone";
import Image from "next/image";
import { Button } from "../small-cards/Button";
import { AlchemyLogoSmall } from "../icons/alchemy-logo-small";
import { CopyLeftIcon } from "../icons/copy-left";
import { TooltipComponent } from "../ui/tooltip";
import { OTPInput, OTPCodeType, initialOTPValue } from "../ui/OTPInput";
import { useSigner } from "@account-kit/react";
import { useTheme } from "@/state/useTheme";

type MFAStage = "init" | "qr" | "manual" | "verify" | "success";

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
  const [stage, setStage] = useState<MFAStage>("init");
  const [otp, setOTP] = useState<OTPCodeType>(initialOTPValue);
  const [totpUrl, setTotpUrl] = useState<string | null>(null);
  const [mfaKey, setMfaKey] = useState<string | null>(null);
  const [multiFactorId, setMultiFactorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const signer = useSigner();
  const handleClose = () => setIsModalOpen(false);

  const handleInitMFASetup = async () => {
    setStage("init");
    setOTP(initialOTPValue);
    setTotpUrl(null);
    setMultiFactorId(null);
    setError(null);
    setIsModalOpen(true);
  };
  const resetModalState = () => {
    setIsModalOpen(false);
    setStage("init");
    setOTP(initialOTPValue);
    setTotpUrl(null);
    setMultiFactorId(null);
    setError(null);
  };

  const startMFASetup = async () => {
    if (!signer) {
      setError("Signer not available");
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
        setError("Failed to generate MFA setup");
      }
    } catch (error) {
      console.error("Error adding MFA:", error);
      setError("Failed to set up MFA.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (!multiFactorId || !otp.join("") || !signer) {
      setError("Missing required information for verification");
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
      setError("Verification failed.");
      setOTP(initialOTPValue);
    } finally {
      setIsLoading(false);
    }
  };

  const removeMFA = async () => {
    if (!signer) {
      setError("Signer not available");
      return;
    }

    setIsRemoving(true);
    try {
      const factors = await signer.inner.getMfaFactors();
      const factorId = factors?.multiFactors?.[0]?.multiFactorId;

      if (!factorId) {
        setError("No MFA factor ID found");
        return;
      }

      await signer.inner.removeMfa({
        multiFactorIds: [factorId],
      });

      onMfaRemoved?.();
      resetModalState();
    } catch (error) {
      console.error("Error removing MFA:", error);
      setError("Failed to remove MFA.");
    } finally {
      setIsRemoving(false);
    }
  };

  useEffect(() => {
    if (otp.every((value) => value !== "")) {
      verifyTOTP();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

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
        <div className={`akui-modal md:w-[400px] rounded-lg overflow-hidden`}>
          <div className=" p-6 flex flex-col items-center">
            <button className="self-end" onClick={handleClose}>
              <XIcon height="20px" width="20px" className="stroke-fg-primary" />
            </button>
            <MFASContent
              stage={stage}
              setStage={setStage}
              setOTP={setOTP}
              otp={otp}
              totpUrl={totpUrl}
              mfaKey={mfaKey}
              isLoading={isLoading}
              startMFASetup={startMFASetup}
              resetModalState={resetModalState}
            />
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
                {error}
              </div>
            )}
            <div className="flex flex-row gap-1 items-center h-[14px] text-fg-disabled">
              <span className="text-[11px] pt-[1px]">protected by</span>
              <AlchemyLogo className="fill-fg-disabled" />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

const MFASContent = ({
  stage,
  setStage,
  setOTP,
  otp,
  mfaKey,
  totpUrl,
  isLoading,
  startMFASetup,
  resetModalState,
}: {
  stage: MFAStage;
  setStage: (stage: MFAStage) => void;
  setOTP: (otp: OTPCodeType) => void;
  otp: OTPCodeType;
  mfaKey: string | null;
  totpUrl: string | null;
  isLoading: boolean;
  startMFASetup: () => Promise<void>;
  resetModalState: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopyClick = () => {
    if (!mfaKey) return;
    navigator.clipboard.writeText(mfaKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const theme = useTheme();
  if (stage === "init") {
    return (
      <>
        <AlchemyTwoToneLogo
          textColor="#0C0C0E"
          logoColor="#363FF9"
          className="mb-5"
        />
        <Image
          src="/images/data-security-icon.png"
          className="mb-5"
          alt="data-security icon"
          width={126}
          height={126}
        />
        <h2 className="font-bold mb-5 text-fg-primary">
          Enable 2-Step Verification
        </h2>
        <p className="mb-5 text-sm text-fg-primary">
          You&apos;re holding serious crypto. Make sure it stays that way.{" "}
          <strong>Secure your assets in 10 seconds.</strong>
        </p>
        <button
          className="akui-btn akui-btn-primary h-10 w-full rounded-lg flex-1 mb-5"
          onClick={startMFASetup}
          disabled={isLoading}
        >
          {isLoading ? "Setting up..." : "Set up authenticator app"}
        </button>
      </>
    );
  }
  if (stage === "qr") {
    return (
      <>
        <h2 className="text-lg font-semibold mb-5 text-fg-primary">
          Set up authenticator app
        </h2>
        <div className="relative mb-5">
          <AlchemyLogoSmall
            height="40px"
            width="40px"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          {isLoading ? (
            <div className="p-4 flex items-center justify-center h-[250px] w-[250px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : totpUrl ? (
            <QRCodeSVG
              className="p-4"
              size={250}
              value={totpUrl}
              bgColor={theme === "dark" ? "#020617" : "#FFFFFF"}
              fgColor={theme === "dark" ? "#FFFFFF" : "#0C0C0E"}
              imageSettings={{
                height: 60,
                width: 60,
                excavate: true,
                src: "",
              }}
            />
          ) : (
            <div className="p-4 flex items-center justify-center h-[250px] w-[250px]">
              No QR code available
            </div>
          )}
        </div>
        <p className="mb-5 text-center text-sm text-fg-primary">
          Alchemy recommends using Google Authenticator. <br />
          Scan the QR code using your app.
        </p>
        <button
          onClick={() => setStage("manual")}
          className="akui-btn akui-btn-link  text-xs mb-5"
        >
          Can&apos;t scan it?
        </button>
        <button
          className="akui-btn akui-btn-primary rounded-lg h-10 w-full mb-5"
          onClick={() => setStage("verify")}
        >
          Next
        </button>
      </>
    );
  }
  if (stage === "manual") {
    return (
      <>
        <h2 className="text-lg font-semibold mb-5 text-fg-primary">
          Set up authenticator app
        </h2>
        <ol className="list-style list-decimal flex flex-col gap-2 ml-6">
          <li className="text-fg-primary">
            In the Google Authenticator app, tap the + button then tap{" "}
            <strong>Enter a setup key</strong>
          </li>
          <li className="text-fg-primary">
            <div className="flex flex-row gap-2">
              <span>
                Enter your email address and this key (spaces don&apos;t
                matter):
                <br />
              </span>
              <TooltipComponent content="Copied to clipboard" open={copied}>
                <button
                  className="flex flex-row gap-1 items-center bg-bg-primary rounded-lg p-3 w-24 h-10 border "
                  onClick={handleCopyClick}
                >
                  <CopyLeftIcon />
                  Copy
                </button>
              </TooltipComponent>
            </div>
            <strong>{mfaKey}</strong>
          </li>
          <li className="text-fg-primary">
            Make sure <strong>Time based</strong> is selected.
          </li>
          <li className="text-fg-primary">
            Tap <strong>Add</strong> to finish.
          </li>
        </ol>
        <div className="flex flex-row items-start gap-2">
          <button
            className=" rounded-lg h-10  mb-5"
            onClick={() => setStage("qr")}
          >
            Back
          </button>
          <button
            className="akui-btn akui-btn-primary rounded-lg h-10 w-full mb-5"
            onClick={() => setStage("verify")}
          >
            Next
          </button>
        </div>
      </>
    );
  }
  if (stage === "verify") {
    return (
      <>
        <h2 className="text-lg font-semibold mb-5 text-fg-primary">
          Enter authenticator app code
        </h2>
        <div className="flex gap-2 mb-5">
          <OTPInput
            value={otp}
            setValue={setOTP}
            setErrorText={() => {}}
            handleReset={() => {}}
            disabled={isLoading}
          />
        </div>
        {isLoading && (
          <div className="flex justify-center mb-5">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        )}
      </>
    );
  }

  if (stage === "success") {
    return (
      <>
        <h2 className="text-lg font-semibold mb-5">Setup Complete!</h2>
        <p className="mb-5 text-center text-sm">
          You will now be asked for a verification code when logging in.
        </p>
        <button
          className="akui-btn akui-btn-primary rounded-lg h-10 w-full mb-5"
          onClick={resetModalState}
        >
          Done
        </button>
      </>
    );
  }
};
