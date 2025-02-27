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

type MFAStage = "init" | "qr" | "manual" | "verify" | "success";

export function MFAModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stage, setStage] = useState<MFAStage>("init");
  const [otp, setOTP] = useState<OTPCodeType>(initialOTPValue);
  const [mfaKey, setMFAKey] = useState<string | null>(null);
  const handleClose = () => setIsModalOpen(false);
  const handleInitMFASetup = () => {
    setStage("init");
    setOTP(initialOTPValue);
    setMFAKey("TEMPORARY KEY");
    setIsModalOpen(true);
  };
  const verifyTOTP = () => {
    setStage("success");
  };
  useEffect(() => {
    if (otp.every((value) => value !== "")) {
      verifyTOTP();
    }
  }, [otp]);

  return (
    <>
      <Button onClick={handleInitMFASetup}>Enable Authenticator App</Button>
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
              mfaKey={mfaKey}
            />
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
}: {
  stage: MFAStage;
  setStage: (stage: MFAStage) => void;
  setOTP: (otp: OTPCodeType) => void;
  otp: OTPCodeType;
  mfaKey: string | null;
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopyClick = () => {
    if (!mfaKey) return;
    navigator.clipboard.writeText(mfaKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
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
        <h2 className="font-bold mb-5">Enable 2-Step Verification</h2>
        <p className="mb-5 text-sm">
          You&apos;re holding serious crypto. Make sure it stays that way.{" "}
          <strong>Secure your assets in 10 seconds.</strong>
        </p>
        <button
          className="akui-btn akui-btn-primary h-10 w-full rounded-lg flex-1 mb-5"
          onClick={() => setStage("qr")}
        >
          Set up authenticator app
        </button>
      </>
    );
  }
  if (stage === "qr") {
    return (
      <>
        <h2 className="text-lg font-semibold mb-5">Set up authenticator app</h2>
        <div className="relative mb-5">
          <AlchemyLogoSmall
            height="40px"
            width="40px"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          {/* TODO: Loading state here if no mfaKey */}
          {mfaKey && (
            <QRCodeSVG
              className="p-4"
              size={250}
              value={mfaKey}
              imageSettings={{
                height: 60,
                width: 60,
                excavate: true,
                src: "",
              }}
            />
          )}
        </div>
        <p className="mb-5 text-center text-sm">
          Alchemy recommends using Google Authenticator. <br />
          Scan the QR code using your app.
        </p>
        <button
          onClick={() => setStage("manual")}
          className="akui-btn akui-btn-link  text-xs mb-5"
        >
          Can&apos;t scan it?
        </button>
        <button className="akui-btn akui-btn-primary rounded-lg h-10 w-full mb-5">
          Next
        </button>
      </>
    );
  }
  if (stage === "manual") {
    return (
      <>
        <h2 className="text-lg font-semibold mb-5">Set up authenticator app</h2>
        <ol className="list-style list-decimal flex flex-col gap-2 ml-6">
          <li>
            In the Google Authenticator app, tap the + button then tap{" "}
            <strong>Enter a setup key</strong>
          </li>
          <li>
            <div className="flex flex-row gap-2">
              <span>
                Enter your email address and this key (spaces don&apos;t
                matter):
                <strong>{mfaKey}</strong>
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
          </li>
          <li>
            Make sure <strong>Time based</strong> is selected.
          </li>
          <li>
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
        <h2>Enter authenticator code</h2>
        <div className="flex gap-2">
          <OTPInput
            value={otp}
            setValue={setOTP}
            setErrorText={() => {}}
            handleReset={() => {}}
            disabled={false}
          />
        </div>
      </>
    );
  }
};
