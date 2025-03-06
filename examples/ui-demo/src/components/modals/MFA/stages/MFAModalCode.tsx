import { useState } from "react";
import { MFAStage } from "../MFAModal";
import { TooltipComponent } from "@/components/ui/tooltip";
import { CopyLeftIcon } from "@/components/icons/copy-left";
export function MFAModalCode({
  setStage,
  mfaKey,
}: {
  setStage: (stage: MFAStage) => void;
  mfaKey: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopyClick = () => {
    if (!mfaKey) return;
    navigator.clipboard.writeText(mfaKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <>
      <h2 className="text-lg font-semibold mb-5 text-fg-primary">
        Set up authenticator app
      </h2>
      <ol className="list-style list-decimal flex flex-col gap-2 ml-6 mb-5">
        <li className="text-fg-primary">
          In the Google Authenticator app, tap the + button then tap{" "}
          <strong>Enter a setup key</strong>
        </li>
        <li className="text-fg-primary">
          <div className="flex flex-row gap-2">
            <span>
              Enter your email address and this key (spaces don&apos;t matter):
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
          <strong>{mfaKey?.match(/.{1,4}/g)?.join(" ")}</strong>
        </li>
        <li className="text-fg-primary">
          Make sure <strong>Time based</strong> is selected.
        </li>
        <li className="text-fg-primary">
          Tap <strong>Add</strong> to finish.
        </li>
      </ol>
      <div className="flex flex-row items-start w-full gap-2">
        <button
          className="rounded-lg h-10  mb-5 mr-2 border p-3 flex justify-center items-center"
          onClick={() => setStage("qr")}
        >
          Back
        </button>
        <button
          className="akui-btn akui-btn-primary rounded-lg h-10  mb-5 flex-1 "
          onClick={() => setStage("verify")}
        >
          Next
        </button>
      </div>
    </>
  );
}
