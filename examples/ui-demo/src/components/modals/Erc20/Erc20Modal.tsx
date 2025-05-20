import React, { Fragment, useState, useEffect } from "react";
import { Dialog, useAccount } from "@account-kit/react";
import { Transition } from "@headlessui/react";
import { XIcon } from "../../icons/x";
import Image from "next/image";
import { Button } from "../../small-cards/Button";
import { DynamicHeight } from "@/components/ui/dynamic-height";
import BagIcon from "../components/BagIcon";
import { cn } from "@/lib/utils";
import { useReadErc20Balance } from "../../../hooks/useReadErc20Balance";
import { useMintErc20 } from "../../../hooks/useMintErc20";
import { useMintNftWithErc20Sponsorship } from "../../../hooks/useMintNftWithErc20Sponsorship";
import { DEMO_USDC_ADDRESS } from "../../../hooks/7702/dca/constants";
import { alchemy, arbitrumSepolia, baseSepolia } from "@account-kit/infra";
import { AccountMode } from "@/app/config";
import { LoadingIcon } from "../../icons/loading";
import { formatEther, parseEther } from "viem";

type Erc20ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGetUSDC?: () => void;
  onBuyNFT?: () => void;
  accountMode: AccountMode;
};

const AMOUNT_OF_USDC_TO_MINT = 100;
const NFT_TOTAL_PRICE = 4;

export function Erc20Modal({
  isOpen,
  onClose,
  onGetUSDC = () => {},
  onBuyNFT = () => {},
  accountMode,
}: Erc20ModalProps) {
  const { address: accountAddress } = useAccount({
    type: "ModularAccountV2",
    accountParams: { mode: accountMode },
  });
  console.log("accountAddress", accountAddress);
  const chain = accountMode === "7702" ? baseSepolia : arbitrumSepolia;
  const rpcUrl = chain.rpcUrls.default.http[0];
  const transport = alchemy({
    rpcUrl: accountMode === "7702" ? "/api/rpc-base-sepolia" : "/api/rpc",
  });

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

  const {
    mintAsync,
    isMinting,
    isLoadingClient: isLoadingMintClient,
  } = useMintErc20({
    amount: String(AMOUNT_OF_USDC_TO_MINT),
    clientOptions: { mode: accountMode, chain, transport },
  });

  const {
    mintNftAsync,
    isMinting: isMintingNft,
    isLoadingClient: isLoadingNftClient,
  } = useMintNftWithErc20Sponsorship({
    clientOptions: { mode: accountMode, chain, transport },
  });
  console.log("balance", balance);
  // Derived flags
  console.log(balance);
  const n = parseFloat(balance ?? "0");

  const numericBalance = Math.floor(n * 100) / 100;

  const readyToBuyNft = numericBalance >= NFT_TOTAL_PRICE;

  const balanceDisplay = isLoadingBalance
    ? "Loading..."
    : isErrorBalance
    ? "Error"
    : `${numericBalance.toFixed(2)} USDC`;

  // Handlers
  const handleGetUSDC = async () => {
    if (!accountAddress) return;
    // setIsRefreshingAfterMint(true);
    try {
      await mintAsync();
      await refetchBalance();
      onGetUSDC();
    } catch (e) {
      console.error("Failed to get USDC:", e);
    } finally {
      // setIsRefreshingAfterMint(false);
    }
  };

  const handleClose = () => {
    // setIsRefreshingAfterMint(false);
    onClose();
  };

  const handleBuyNFT = async () => {
    if (!accountAddress) return;
    try {
      await mintNftAsync();
      await refetchBalance();
      onBuyNFT();
    } catch (e) {
      console.error("Failed to buy NFT:", e);
    }
  };

  useEffect(() => {
    if (isOpen && accountAddress) {
      refetchBalance();
    }
  }, [isOpen, accountAddress, refetchBalance]);

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <div className="akui-modal md:w-[607px] rounded-lg overflow-hidden">
        <DynamicHeight>
          <div className="p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-start">
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

            {/* Body */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Image */}
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

              {/* Details */}
              <div className="md:w-1/2 flex flex-col">
                {/* 1) Warning */}
                <div className="flex flex-col gap-4 pb-2">
                  <div className="h-12">
                    <Transition
                      as={Fragment}
                      show={!readyToBuyNft}
                      enter="transition-opacity duration-500"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition-opacity duration-500"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="bg-demo-surface-critical-subtle text-fg-critical py-1.5 px-2 rounded-lg w-[271px]">
                        <p className="font-medium text-xs leading-[18px]">
                          Insufficient funds. You need {NFT_TOTAL_PRICE} USDC to
                          complete this purchase.
                        </p>
                      </div>
                    </Transition>
                  </div>
                  {/* Wallet Balance */}
                  <div
                    className={cn(
                      "flex justify-between items-center transition-all duration-500",
                      readyToBuyNft && "transform -translate-y-16" // Animation: move up when busy
                    )}
                  >
                    <span className="text-fg-secondary font-medium text-sm leading-relaxed">
                      Wallet Balance
                    </span>
                    <div className="flex items-center">
                      <span
                        className={cn(
                          "text-fg-primary font-medium text-sm leading-5 transition-all duration-500",
                          !isLoadingBalance &&
                            !readyToBuyNft &&
                            "text-demo-surface-critical mr-2",
                          readyToBuyNft && "transform translate-x-20 mr-0" // Animation: move text right when busy
                        )}
                      >
                        {balanceDisplay}
                      </span>
                      <div className="min-w-[80px]">
                        <Transition
                          as={Fragment}
                          show={!readyToBuyNft}
                          enter="transition-opacity duration-500"
                          enterFrom="opacity-0"
                          enterTo="opacity-100"
                          leave="transition-opacity duration-500"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <button
                            className={cn(
                              "akui-btn-auth akui-btn font-medium text-xs leading-[18px] py-2 px-2.5 rounded-lg",
                              isMinting &&
                                "border border-[#E2E8F0] bg-[#EFF4F9] text-[#CBD5E1]",
                              !isMinting && "bg-[#27272A] text-demo-text-invert"
                            )}
                            onClick={handleGetUSDC}
                            disabled={isMinting}
                          >
                            {isMinting && <LoadingIcon />}
                            Get USDC
                          </button>
                        </Transition>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Details */}
                <div
                  className={cn(
                    "flex flex-col gap-2 pt-4 border-t border-bg-separator transition-all duration-500",
                    readyToBuyNft && "transform -translate-y-16" // Animation: move up when busy
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
                readyToBuyNft && !isMintingNft && !isLoadingNftClient
                  ? "bg-[#27272A] text-white border-[#27272A] cursor-pointer"
                  : "border border-[#E2E8F0] bg-[#EFF4F9] text-[#CBD5E1] cursor-not-allowed"
              )}
              disabled={!readyToBuyNft || isMintingNft || isLoadingNftClient}
              onClick={handleBuyNFT}
            >
              <BagIcon />
              <span className="font-medium">
                {isMintingNft
                  ? "Buying..."
                  : isLoadingNftClient
                  ? "Loading Client..."
                  : "Buy NFT"}
              </span>
            </button>
          </div>
        </DynamicHeight>
      </div>
    </Dialog>
  );
}
