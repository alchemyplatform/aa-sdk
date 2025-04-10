import { QRCodeSVG } from "qrcode.react";
import { MFAStage } from "../MFAModal";
import { useTheme } from "@/state/useTheme";
import { MobileAuthenticatorLinks } from "@/components/shared/MobileAuthenticatorLinks";

export function MFAModalQR({
  totpUrl,
  isLoading,
  setStage,
}: {
  totpUrl: string | null;
  isLoading: boolean;
  setStage: (stage: MFAStage) => void;
}) {
  const theme = useTheme();

  return (
    <>
      <h2 className="text-lg font-semibold mb-5 text-fg-primary">
        Set up authenticator app
      </h2>

      <div className="relative mb-5">
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
        onClick={() => setStage("code")}
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
      <MobileAuthenticatorLinks />
    </>
  );
}
