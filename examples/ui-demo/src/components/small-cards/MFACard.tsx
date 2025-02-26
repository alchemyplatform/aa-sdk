import { ThreeStarsIcon } from "../icons/three-stars";

import { MFAModal } from "../modals/MFAModal";

export function MFACard() {
  return (
    <div className="bg-bg-surface-default rounded-lg p-4 xl:p-6 w-full xl:w-[326px] xl:h-[478px] flex flex-col shadow-smallCard">
      <div className="flex xl:flex-col gap-4">
        <div className="flex-shrink-0 bg-[#DCE9FF] rounded-xl sm:mb-3 xl:mb-0 flex justify-center items-center relative h-[67px] w-[60px] sm:h-[154px] sm:w-[140px] xl:h-[222px] xl:w-full">
          <ThreeStarsIcon className="h-9 w-9 sm:h-[74px] sm:w-[74px] xl:h-[94px] xl:w-[94px]" />
        </div>
        <div className="w-full mb-3">
          <h3 className="text-fg-primary xl:text-xl font-semibold mb-1">
            Multi-factor <br />
            Authentication
          </h3>
          <p className="text-fg-primary text-sm">
            Lock down your account with MFA. This requires downloading an auth
            app like Google Authenticator.
          </p>
        </div>
      </div>
      <MFAModal />
    </div>
  );
}
