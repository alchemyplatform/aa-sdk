import { Dialog } from "@account-kit/react";
import { XIcon } from "../../icons/x";
import Image from "next/image";
import { Button } from "../../small-cards/Button";
import { DynamicHeight } from "@/components/ui/dynamic-height";
import BagIcon from "../components/BagIcon";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Erc20ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGetUSDC?: () => void;
  onBuyNFT?: () => void;
};

export function Erc20Modal({
  isOpen,
  onClose,
  onGetUSDC = () => {},
  onBuyNFT = () => {},
}: Erc20ModalProps) {
  const [hasUSDC, setHasUSDC] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleGetUSDC = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setHasUSDC(true);
      onGetUSDC();
    }, 1000);
  };

  const handleClose = () => {
    setHasUSDC(false);
    setIsAnimating(false);
    onClose();
  };
  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <div className="akui-modal md:w-[607px] rounded-lg overflow-hidden transition-all duration-300 ease-in-out">
        <DynamicHeight>
          <div className="p-6 flex flex-col transition-all duration-300 ease-in-out">
            {/* Header and Close Button */}
            <div className="flex justify-between items-start w-full mb-2">
              <div className="flex flex-col gap-1.5">
                <h2 className="font-semibold text-xl leading-tight tracking-tighter text-fg-primary">
                  Pay gas with any token
                </h2>
                <p className="text-sm font-normal leading-relaxed text-fg-secondary">
                  Checkout with one click and a single token. USDC is an
                  example.
                </p>
              </div>
              <button
                className="text-fg-secondary w-[40px] h-[40px] flex items-center justify-center hover:bg-btn-secondary rounded-md"
                onClick={handleClose}
              >
                <XIcon className="w-[24px] h-[24px] lg:w-[16px] lg:h-[16px] stroke-fg-primary" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              {/* NFT Image */}
              <div className="md:w-1/2 rounded-lg overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src="/images/erc-20-sponsorship.jpg"
                    alt="NFT"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Transaction Details */}
              <div className="md:w-1/2 flex flex-col">
                <div className="flex flex-col gap-4 pb-2 relative">
                  {/* Error Message */}
                  <div
                    className={cn(
                      "bg-demo-surface-critical-subtle text-fg-critical py-1.5 px-2 rounded-lg w-[271px] h-12 flex items-center transition-opacity duration-500",
                      isAnimating ? "opacity-0" : "opacity-100"
                    )}
                  >
                    <p className="font-medium text-xs leading-[18px]">
                      Insufficient funds. You need 2 USDC to complete this
                      purchase.
                    </p>
                  </div>
                  {/* Wallet Balance */}
                  <div
                    className={cn(
                      "flex justify-between items-center transition-all duration-500",
                      isAnimating && "transform -translate-y-16"
                    )}
                  >
                    <span className="text-fg-secondary font-medium text-sm leading-relaxed">
                      Wallet Balance
                    </span>
                    <div className="flex items-center">
                      <span
                        className={cn(
                          "text-fg-primary font-medium text-sm leading-5 transition-all duration-500",
                          !hasUSDC && "text-demo-surface-critical mr-2",
                          isAnimating && "transform translate-x-20 mr-0"
                        )}
                      >
                        {hasUSDC ? "2.00 USDC" : "0 USDC"}
                      </span>
                      <div
                        className={cn(
                          "transition-opacity duration-500",
                          isAnimating && "opacity-0",
                          !isAnimating && "opacity-100"
                        )}
                      >
                        <Button
                          className="bg-[#27272A] text-demo-text-invert font-medium text-xs leading-[18px] py-2 px-2.5 rounded-lg"
                          onClick={handleGetUSDC}
                        >
                          Get USDC
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Details */}
                <div
                  className={cn(
                    "flex flex-col gap-2 pt-4 border-t border-bg-separator transition-all duration-500",
                    isAnimating && "transform -translate-y-16"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-fg-primary text-sm font-medium leading-5">
                      NFT price
                    </span>
                    <span className="text-fg-primary text-sm leading-relaxed">
                      1.00 USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-primary text-sm font-medium leading-5">
                      Network fee
                    </span>
                    <span className="text-fg-primary text-sm leading-relaxed">
                      0.02 USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-fg-primary font-bold">Total</span>
                    <span className="text-fg-primary font-bold">1.02 USDC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buy Button */}
            <button
              className={cn(
                "flex h-[38px] py-2 px-2.5 justify-center items-center gap-1.5 self-stretch rounded-md mt-6 w-full transition-all duration-300",
                hasUSDC
                  ? "bg-[#27272A] text-white border-[#27272A] cursor-pointer"
                  : "border border-[#E2E8F0] bg-[#EFF4F9] text-[#CBD5E1] cursor-not-allowed"
              )}
              disabled={!hasUSDC}
              onClick={onBuyNFT}
            >
              <BagIcon />
              <span className="font-medium">Buy NFT</span>
            </button>
          </div>
        </DynamicHeight>
      </div>
    </Dialog>
  );
}
