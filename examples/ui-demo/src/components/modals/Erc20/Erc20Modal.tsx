import { Dialog, useAccount } from "@account-kit/react";
import { XIcon } from "../../icons/x";
import Image from "next/image";
import { Button } from "../../small-cards/Button";
import { DynamicHeight } from "@/components/ui/dynamic-height";
import BagIcon from "../components/BagIcon";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useReadErc20Balance } from "../../../hooks/useReadErc20Balance";
import { useMintErc20 } from "../../../hooks/useMintErc20";
import { DEMO_USDC_ADDRESS } from "../../../hooks/7702/dca/constants";
import { alchemy, arbitrumSepolia, baseSepolia } from "@account-kit/infra";
import { AccountMode } from "@/app/config";

type Erc20ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGetUSDC?: () => void;
  onBuyNFT?: () => void;
  accountMode: AccountMode;
};

const REQUIRED_USDC_FOR_MESSAGE = 2;
const NFT_TOTAL_PRICE = 1.02;

export function Erc20Modal({
  isOpen,
  onClose,
  onGetUSDC = () => {},
  onBuyNFT = () => {},
  accountMode,
}: Erc20ModalProps) {
  // Component State
  const [isRefreshingAfterMint, setIsRefreshingAfterMint] = useState(false);

  // Account Kit Hooks & Config
  const { address: accountAddress } = useAccount({
    type: "ModularAccountV2",
    accountParams: {
      mode: accountMode,
    },
  });
  const chain = accountMode === "7702" ? baseSepolia : arbitrumSepolia;
  const rpcUrl = chain.rpcUrls.default.http[0];
  const transport = alchemy({
    rpcUrl: accountMode === "7702" ? "/api/rpc-base-sepolia" : "/api/rpc",
  });
  // Balance Hook
  const {
    balance,
    isLoading: isLoadingBalance,
    isError: isErrorBalance,
    refetch: refetchBalance,
  } = useReadErc20Balance({
    accountAddress,
    tokenAddress: DEMO_USDC_ADDRESS,
    chain,
    rpcUrl,
  });

  // Mint Hook (configured to mint 2 USDC for the demo)
  const {
    mintAsync,
    isMinting,
    isLoadingClient: isLoadingMintClient,
  } = useMintErc20({
    amount: String(REQUIRED_USDC_FOR_MESSAGE), // Mint 2 USDC
    clientOptions: {
      mode: accountMode,
      chain,
      transport,
    },
  });

  const isBusy = isMinting || isLoadingMintClient || isRefreshingAfterMint;
  const numericBalance = Number(balance ?? 0);

  const handleGetUSDC = async () => {
    if (isBusy || !accountAddress || !transport || !chain) return;

    setIsRefreshingAfterMint(true);
    try {
      await mintAsync();
      await refetchBalance();
      onGetUSDC(); // Call original prop
    } catch (e) {
      console.error("Failed to get USDC:", e);
      // Optionally: show toast message with mintError or generic error
    } finally {
      setIsRefreshingAfterMint(false);
    }
  };

  const handleClose = () => {
    setIsRefreshingAfterMint(false);
    onClose();
  };

  // Effect to refetch balance when modal opens and account is available
  useEffect(() => {
    if (isOpen && accountAddress) {
      refetchBalance();
    }
  }, [isOpen, accountAddress, refetchBalance]);

  const canBuyNFT =
    !isBusy &&
    !isLoadingBalance &&
    numericBalance >= NFT_TOTAL_PRICE &&
    !!accountAddress;
  const showInsufficientFundsMessage =
    !isBusy &&
    !isLoadingBalance &&
    numericBalance < REQUIRED_USDC_FOR_MESSAGE &&
    !!accountAddress;
  console.log("showInsufficientFundsMessage", {
    isBusy,
    isLoadingBalance,
    numericBalance,
    REQUIRED_USDC_FOR_MESSAGE,
    accountAddress,
  });
  const showInlineGetUsdcButton =
    !isLoadingBalance &&
    numericBalance < REQUIRED_USDC_FOR_MESSAGE &&
    !!accountAddress;

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
                  {/* Insufficient Funds Message */}
                  <div
                    className={cn(
                      "bg-demo-surface-critical-subtle text-fg-critical py-1.5 px-2 rounded-lg w-[271px] h-12 flex items-center transition-opacity duration-500",
                      isBusy ? "opacity-0" : "opacity-100", // Hide when busy
                      showInsufficientFundsMessage ? "opacity-100" : "opacity-0" // Show based on balance
                    )}
                  >
                    <p className="font-medium text-xs leading-[18px]">
                      Insufficient funds. You need {REQUIRED_USDC_FOR_MESSAGE}{" "}
                      USDC to complete this purchase.
                    </p>
                  </div>

                  {/* Wallet Balance */}
                  <div
                    className={cn(
                      "flex justify-between items-center transition-all duration-500",
                      isBusy && "transform -translate-y-16" // Animation: move up when busy
                    )}
                  >
                    <span className="text-fg-secondary font-medium text-sm leading-relaxed">
                      Wallet Balance
                    </span>
                    <div className="flex items-center">
                      <span
                        className={cn(
                          "text-fg-primary font-medium text-sm leading-5 transition-all duration-500",
                          !isBusy &&
                            !isLoadingBalance &&
                            numericBalance < REQUIRED_USDC_FOR_MESSAGE &&
                            "text-demo-surface-critical mr-2",
                          isBusy && "transform translate-x-20 mr-0" // Animation: move text right when busy
                        )}
                      >
                        {isLoadingBalance && !isBusy
                          ? "Loading..."
                          : isErrorBalance
                          ? "Error"
                          : `${numericBalance.toFixed(2)} USDC`}
                      </span>
                      <div
                        className={cn(
                          "transition-opacity duration-500",
                          // Hide button cell if busy, or if balance is sufficient
                          isBusy || !showInlineGetUsdcButton
                            ? "opacity-0"
                            : "opacity-100"
                        )}
                      >
                        {showInlineGetUsdcButton && !isBusy && (
                          <Button
                            className="bg-[#27272A] text-demo-text-invert font-medium text-xs leading-[18px] py-2 px-2.5 rounded-lg"
                            onClick={handleGetUSDC}
                            disabled={isBusy || !accountAddress}
                          >
                            Get USDC
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Details */}
                <div
                  className={cn(
                    "flex flex-col gap-2 pt-4 border-t border-bg-separator transition-all duration-500",
                    isBusy && "transform -translate-y-16" // Animation: move up when busy
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
                    <span className="text-fg-primary font-bold">
                      {NFT_TOTAL_PRICE.toFixed(2)} USDC
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buy Button */}
            <button
              className={cn(
                "flex h-[38px] py-2 px-2.5 justify-center items-center gap-1.5 self-stretch rounded-md mt-6 w-full transition-all duration-300",
                canBuyNFT
                  ? "bg-[#27272A] text-white border-[#27272A] cursor-pointer"
                  : "border border-[#E2E8F0] bg-[#EFF4F9] text-[#CBD5E1] cursor-not-allowed"
              )}
              disabled={!canBuyNFT}
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
