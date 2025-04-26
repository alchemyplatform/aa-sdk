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
    <div className="flex lg:hidden flex-col flex-1 max-h-[calc(100svh-100px)] box-content px-4 gap-4 justify-between h-full">
      {/* Header Text */}
      <div>
        <h3 className="min-[320px]:text-3xl text-fg-primary min-[390px]:text-5xl min-[640px]:text-6xl min-[640px]:mt-12 text-center font-semibold tracking-tight mb-4 leading-none">
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
        <p className="text-base font-normal tracking-tight text-center text-fg-secondary">
          Zero-friction onboarding, one-click transactions
        </p>
      </div>
      {/* Image Wrapper */}
      <div className="relative mx-auto max-w-[500px] flex items-center justify-center">
        <video
          src="/videos/splash-demo.mov"
          className="w-full h-full object-contain"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <div className="lg:mt-24">
        {/* Bottom action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="akui-btn akui-btn-primary h-10 w-full lg:w-auto flex-1 m-0"
            onClick={() => {
              openAuthModal();
            }}
          >
            Try it
          </button>
          <a
            href="https://accountkit.alchemy.com/"
            target="_blank"
            className="akui-btn akui-btn-secondary mb-6 h-10 w-full lg:w-auto flex-1 m-0"
          >
            View docs
          </a>
        </div>
        <p className="text-center text-sm text-fg-secondary">
          Visit desktop site to customize <br className="sm:hidden" /> styles
          and auth methods
        </p>
      </div>
    </div>
  );
}
