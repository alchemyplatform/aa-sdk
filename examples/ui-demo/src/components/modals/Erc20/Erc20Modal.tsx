import { Dialog } from "@account-kit/react";
import { XIcon } from "../../icons/x";
import Image from "next/image";
import { Button } from "../../small-cards/Button";
import { DynamicHeight } from "@/components/ui/dynamic-height";
import BagIcon from "../components/BagIcon";

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
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
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
                onClick={onClose}
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
              <div className="md:w-1/2 flex flex-col gap-4">
                <div className="flex flex-col gap-4 border-b border-bg-separator pb-2">
                  {/* Error Message */}
                  <div className="bg-demo-surface-critical-subtle text-fg-critical py-1.5 px-2 rounded-lg w-[271px] h-12 flex items-center">
                    <p className="font-medium text-xs leading-[18px]">
                      Insufficient funds. You need 2 USDC to complete this
                      purchase.
                    </p>
                  </div>
                  {/* Wallet Balance */}
                  <div className="flex justify-between items-center">
                    <span className="text-fg-secondary font-medium text-sm leading-relaxed">
                      Wallet Balance
                    </span>
                    <div className="flex items-center">
                      <span className="text-fg-primary text-demo-surface-critical font-medium text-sm leading-5 mr-2">
                        0 USDC
                      </span>
                      <Button
                        className="bg-[#27272A] text-demo-text-invert font-medium text-xs leading-[18px] py-2 px-2.5 rounded-lg"
                        onClick={onGetUSDC}
                      >
                        Get USDC
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Price Details */}
                <div className="flex flex-col gap-2">
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
              className="flex h-[38px] py-2 px-2.5 justify-center items-center gap-1.5 self-stretch rounded-md border border-[#E2E8F0] bg-[#EFF4F9] text-[#CBD5E1] mt-6 w-full cursor-not-allowed"
              disabled
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
