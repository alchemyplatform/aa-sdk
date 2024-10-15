import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuthModal, useSignerStatus } from "@account-kit/react";
import { useEffect } from "react";

export function MobileSplashPage() {
  const { openAuthModal } = useAuthModal();
  const { isAuthenticating } = useSignerStatus();
  const breakpoint = useBreakpoint();

  useEffect(() => {
    if (breakpoint === "sm" && isAuthenticating) {
      openAuthModal();
    }
  }, [breakpoint, isAuthenticating, openAuthModal]);

  return (
    <div className="flex flex-col flex-1 pb-5 h-auto max-h-[calc(100svh-100px)] box-content p-4 pt-[78px]">
      {/* Header Text */}
      <>
        <h3 className="text-[36px] min-[430px]:text-[46px] sm:text-[56px] sm:leading-[60px] text-center font-semibold tracking-tight text-fg-primary">
          Web2 UX,{" "}
          <span
            className="whitespace-nowrap"
            style={{
              background:
                "linear-gradient(126deg, #FF9C27 4.59%, #FD48CE 108.32%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            onchain
          </span>
        </h3>
        <p className="text-base text-fg-secondary font-normal tracking-tight text-center mt-3">
          Zero-friction onboarding, one-click transactions
        </p>
      </>
      {/* Image Wrapper */}
      <div className="flex-1 h-auto min-h-0 flex">
        <div className="relative my-[20px] flex items-center justify-center flex-1 ">
          <video
            src="/videos/splash-demo.mov"
            className="w-full h-full object-contain"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      </div>

      <div className="sm:mt-auto">
        {/* Bottom action buttons */}
        <div className="flex flex-col sm:flex-row">
          <button
            className="btn btn-primary w-full sm:w-auto mb-2 sm:mb-0 flex-1 m-0 sm:mr-2"
            onClick={() => {
              openAuthModal();
            }}
          >
            Try it
          </button>
          <a
            href="https://accountkit.alchemy.com/"
            target="_blank"
            className="btn btn-secondary w-full sm:w-auto flex-1 m-0 sm:ml-2"
          >
            View docs
          </a>
        </div>
      </div>
    </div>
  );
}
