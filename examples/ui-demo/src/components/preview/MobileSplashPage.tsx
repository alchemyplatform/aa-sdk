import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuthModal, useSignerStatus } from "@account-kit/react";
import { useEffect } from "react";

export function MobileSplashPage() {
  const { openAuthModal } = useAuthModal();
  const { isAuthenticating } = useSignerStatus();
  const breakpoint = useBreakpoint();

  useEffect(() => {
    if (breakpoint === "sm" && isAuthenticating) {
      console.log("openAuthModal");
      openAuthModal();
    }
  }, [breakpoint, isAuthenticating, openAuthModal]);

  return (
    <div className="flex flex-col flex-1 pb-5 h-auto max-h-[calc(100svh-100px)] box-content p-4">
      {/* Header Text */}
      <>
        <h3 className="text-[36px] min-[430px]:text-[46px] xl:text-[56px] xl:leading-[60px] text-center font-semibold tracking-tight mb-4">
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
        <p className="text-base font-normal tracking-tight text-center text-demo-fg-secondary">
          Zero-friction onboarding, one-click transactions
        </p>
      </>
      {/* Image Wrapper */}
      <div className="relative my-[20px] h-[40vh] flex items-center justify-center">
        <video
          src="/videos/splash-demo.mov"
          className="w-full h-full object-contain"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <div className="xl:mt-24">
        {/* Bottom action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="btn btn-primary h-10 w-full xl:w-auto flex-1 m-0"
            onClick={() => {
              openAuthModal();
            }}
          >
            Try it
          </button>
          <a
            href="https://accountkit.alchemy.com/"
            target="_blank"
            className="btn btn-secondary mb-6 h-10 w-full xl:w-auto flex-1 m-0"
          >
            View docs
          </a>
        </div>
      </div>
      <p className="text-center text-sm text-fg-secondary">
        Visit desktop site to customize <br className="xl:hidden" /> styles and
        auth methods
      </p>
    </div>
  );
}
