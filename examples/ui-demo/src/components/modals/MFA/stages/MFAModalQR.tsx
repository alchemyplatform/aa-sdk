import { QRCodeSVG } from "qrcode.react";
import { MFAStage } from "../MFAModal";
import { useTheme } from "@/state/useTheme";
import { AppStore } from "@/components/icons/app-store";
import { GooglePlay } from "@/components/icons/google-play";
import { useMemo } from "react";
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
  const isIOS = useMemo(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }, []);
  const isAndroid = useMemo(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /android/.test(userAgent);
  }, []);

  return (
    <>
      <h2 className="text-lg font-semibold mb-5 text-fg-primary">
        Set up authenticator app
      </h2>
      {isIOS && (
        <a
          className="relative mb-5"
          href="https://apps.apple.com/us/app/google-authenticator/id388497605"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AppStore />
        </a>
      )}
      {isAndroid && (
        <a
          className="relative mb-5"
          href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GooglePlay />
        </a>
      )}
      <div className="relative mb-5">
        {/* <AlchemyLogoSmall
    height="40px"
    width="40px"
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  /> */}
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
            // imageSettings={{
            //   height: 60,
            //   width: 60,
            //   excavate: true,
            //   src: "",
            // }}
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
    </>
  );
}
