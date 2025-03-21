import { AlchemyTwoToneLogo } from "@/components/icons/alchemy-two-tone";
import Image from "next/image";

export function MFAModalStart({
  startMFASetup,
  isLoading,
}: {
  startMFASetup: () => void;
  isLoading: boolean;
}) {
  return (
    <>
      <AlchemyTwoToneLogo
        textColor="#0C0C0E"
        logoColor="#363FF9"
        className="mb-5"
      />
      <Image
        src="/images/dataSecurityIcon.png"
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
