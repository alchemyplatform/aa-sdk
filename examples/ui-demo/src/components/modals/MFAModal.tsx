import { Dialog } from "@account-kit/react";
import { useState } from "react";
import { Button } from "../small-cards/Button";
import { XIcon } from "../icons/x";
import { QRCodeSVG } from "qrcode.react";

type MFAStage = "init" | "setup" | "verify" | "success";
export function MFAModal() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const [stage, setStage] = useState<MFAStage>("init");
  const [otp, setOTP] = useState("");
  const handleSubmitOTP = () => {
    setIsOpen(false);
    setStage("success");
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Enable Authenticator App</Button>
      <Dialog isOpen={isOpen} onClose={handleClose}>
        <div className={`akui-modal md:w-[400px] rounded-lg overflow-hidden`}>
          <div className=" p-6 flex flex-col items-center">
            <MFASContent
              stage={stage}
              setStage={setStage}
              handleClose={handleClose}
              handleSubmitOTP={handleSubmitOTP}
              setOTP={setOTP}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}

const MFASContent = ({
  stage,
  setStage,
  handleSubmitOTP,
  handleClose,
  setOTP,
}: {
  stage: MFAStage;
  setStage: (stage: MFAStage) => void;
  handleSubmitOTP: () => void;
  handleClose: () => void;
  setOTP: (otp: string) => void;
}) => {
  if (stage === "init") {
    return (
      <>
        <button className="bg-[red]" onClick={handleClose}>
          <XIcon />
        </button>

        <h2>Enable 2-Step Verification</h2>
        <p>
          You&apos;re holding serious crypto. Make sure it stays that way.{" "}
          <strong>Secure your assets in 10 seconds.</strong>
        </p>
        <button onClick={() => setStage("setup")}>
          Set up authenticator app
        </button>
      </>
    );
  }
  if (stage === "setup") {
    return (
      <>
        <button className="" onClick={handleClose}>
          <XIcon />
        </button>

        <h2>Set up authenticator app</h2>
        <QRCodeSVG size={320} value="https://reactjs.org/" />
        <p>
          Alchemy recommends using Google Authenticator. <br />
          Scan the QR code using your app.
        </p>
        <button>Can&apos;t scan it?</button>
        <button onClick={() => setStage("verify")}>Next</button>
      </>
    );
  }
  if (stage === "verify") {
    return (
      <>
        <h2>Enter authenticator code</h2>
        <div className="flex gap-2">
          <input type="text" onChange={(e) => setOTP(e.target.value)} />
          <button onClick={handleSubmitOTP}>submit</button>
        </div>
      </>
    );
  }
};
