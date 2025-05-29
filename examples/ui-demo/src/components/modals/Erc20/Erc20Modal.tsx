import React, { Fragment, useState, useEffect } from "react";
import { Dialog, useAccount } from "@account-kit/react";
import { Transition } from "@headlessui/react";
import { XIcon } from "../../icons/x";
import Image from "next/image";
import { DynamicHeight } from "@/components/ui/dynamic-height";
import BagIcon from "./BagIcon";
import { cn } from "@/lib/utils";
import { useReadErc20Balance } from "../../../hooks/useReadErc20Balance";
import { useMintErc20 } from "../../../hooks/useMintErc20";
import { useSendUOsErc20Sponsorship } from "../../../hooks/useSendUOsErc20Sponsorship";
import { alchemy, arbitrumSepolia, baseSepolia } from "@account-kit/infra";
import { AccountMode } from "@/app/config";
import { LoadingIcon } from "../../icons/loading";
import { MintStages } from "@/components/small-cards/MintStages";
import { ModalCTAButton } from "../../shared/ModalCTAButton";
import { getNftMintBatchUOs } from "./utils";
import { useEstimateGasErc20Sponsorship } from "../../../hooks/useEstimateGasErc20Sponsorship";
import { useGetEthPrice } from "../../../hooks/useGetEthPrice";
import { DEMO_USDC_ADDRESS_6_DECIMALS } from "../../../utils/constants";

type Erc20ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  accountMode: AccountMode;
  imageUri?: string;
  onNftMinted?: () => void;
};

const AMOUNT_OF_USDC_TO_MINT = 10;
const MINIMUM_USDC_BALANCE = 2;
const nftPrice = 1;

export function Erc20Modal({
  isOpen,
  onClose,
  accountMode,
  imageUri,
  onNftMinted,
}: Erc20ModalProps) {
  const [networkFee, setNetworkFee] = useState(0);
  const { address: accountAddress } = useAccount({
    type: "ModularAccountV2",
    accountParams: { mode: accountMode },
  });

  const { data: ethPriceData, isLoading: isLoadingEthPrice } = useGetEthPrice();

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
    tokenAddress: DEMO_USDC_ADDRESS_6_DECIMALS,
    chain,
    rpcUrl,
    accountMode,
  });

  const {
    mintAsync,
    isMinting,
    reset: resetMint,
  } = useMintErc20({
    amount: String(AMOUNT_OF_USDC_TO_MINT),
    clientOptions: { mode: accountMode, chain, transport },
  });

  const {
    sendUOsAsync: mintNftAsync,
    isSending: isMintingNft,
    isLoadingClient: isLoadingNftClient,
    txHash: mintNftTxHash,
    reset: resetMintNft,
  } = useSendUOsErc20Sponsorship({
    clientOptions: { mode: accountMode, chain, transport },
    toastText: "NFT minted successfully",
  });

  const {
    estimateGasAsync: estimateMintNftFee,
    isEstimating: isEstimatingGas,
  } = useEstimateGasErc20Sponsorship({
    clientOptions: { mode: accountMode, chain, transport },
  });

  const balanceFloat = parseFloat(balance ?? "0");
  const readyToBuyNft = balanceFloat >= MINIMUM_USDC_BALANCE;

  const numericBalance = Math.floor(balanceFloat * 100) / 100;
  const balanceDisplay = isLoadingBalance
    ? "Loading..."
    : isErrorBalance
    ? "Error"
    : `${numericBalance === 0 ? "0" : numericBalance.toFixed(2)} USDC`;

  const handleGetUSDC = async () => {
    if (!accountAddress) return;

    try {
      await mintAsync();
      await refetchBalance();
    } catch (e) {
      console.error("Failed to get USDC:", e);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleBuyNFT = async () => {
    if (!accountAddress) return;

    if (mintNftTxHash) {
      resetMintNft();
      return;
    }

    try {
      const uos = await getNftMintBatchUOs(accountAddress);
      await mintNftAsync(uos);
      await refetchBalance();
      if (onNftMinted) {
        onNftMinted();
      }
    } catch (e) {
      console.error("Failed to buy NFT:", e);
    }
  };

  useEffect(() => {
    if (isOpen && accountAddress) {
      refetchBalance();
    }
  }, [isOpen, accountAddress, refetchBalance]);

  useEffect(() => {
    const fetchAndEstimateFee = async () => {
      if (
        isOpen &&
        accountAddress &&
        ethPriceData?.price &&
        !isLoadingEthPrice
      ) {
        try {
          const uos = await getNftMintBatchUOs(accountAddress);
          const feeResult = await estimateMintNftFee(uos);
          if (feeResult && feeResult.feeEth) {
            const calculatedNetworkFee =
              parseFloat(feeResult.feeEth) * ethPriceData.price;
            setNetworkFee(calculatedNetworkFee);
          } else {
            console.warn("Fee estimation did not return expected data.");
            setNetworkFee(0);
          }
        } catch (error) {
          setNetworkFee(0);
        }
      } else if (isOpen && accountAddress && !isLoadingEthPrice) {
        setNetworkFee(0);
        if (!ethPriceData?.price) {
          console.warn("ETH price not available for fee estimation.");
        }
      }
    };

    fetchAndEstimateFee();
  }, [
    isOpen,
    accountAddress,
    estimateMintNftFee,
    ethPriceData?.price,
    isLoadingEthPrice,
    balance,
  ]);

  useEffect(() => {
    resetMintNft();
    resetMint();
  }, [accountMode, resetMintNft, resetMint]);

  const buyNftButtonEnabled =
    readyToBuyNft && !isMintingNft && !isLoadingNftClient;

  let bagIconColor = "#CBD5E1";
  if (mintNftTxHash) {
    bagIconColor = "#475569";
  } else if (buyNftButtonEnabled) {
    bagIconColor = "white";
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <div className="akui-modal md:w-[607px] rounded-lg md:overflow-hidden overflow-auto max-h-[100vh]">
        <DynamicHeight>
          <div className="p-5 flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1.5">
                <h2 className="font-semibold text-xl leading-tight tracking-tighter text-fg-primary">
                  Pay gas with any token
                </h2>
                <p className="text-sm font-normal leading-relaxed text-fg-secondary">
                  Checkout with one click and a single token, for example USDC.
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
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="md:w-1/2 rounded-lg overflow-hidden">
                <div className="relative aspect-square">
                  {imageUri ? (
                    <Image
                      src={imageUri}
                      alt="NFT"
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <LoadingIcon />
                  )}
                </div>
              </div>

              {/* Details */}
              {!isMintingNft && !mintNftTxHash && (
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
                        <div className="bg-demo-surface-critical-subtle text-fg-critical py-1.5 px-2 rounded-lg w-full">
                          <p className="font-medium text-xs leading-[18px] w-full">
                            Insufficient funds. Minimum balance of 1 USDC plus
                            gas fees required.
                          </p>
                        </div>
                      </Transition>
                    </div>
                    {/* Wallet Balance */}
                    <div
                      className={cn(
                        "flex justify-between items-center transition-all duration-500 whitespace-nowrap",
                        readyToBuyNft && "transform -translate-y-16"
                      )}
                    >
                      <span className="text-fg-secondary text-sm leading-relaxed">
                        Wallet Balance
                      </span>
                      <div className="flex items-center">
                        <span
                          className={cn(
                            "text-fg-primary text-sm leading-5 font-medium transition-all duration-500",
                            !isLoadingBalance &&
                              !readyToBuyNft &&
                              "text-demo-surface-critical mr-2",
                            readyToBuyNft && "transform translate-x-20 mr-0"
                          )}
                        >
                          {balanceDisplay}
                        </span>
                        <div className="min-w-[80px] h-8">
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
                                "akui-btn-auth akui-btn font-medium text-xs leading-[18px] py-2 px-2.5 rounded-lg h-8 disabled:opacity-100",
                                isMinting &&
                                  "border border-[#E2E8F0] bg-[#EFF4F9] text-[#CBD5E1]",
                                !isMinting &&
                                  "bg-[#27272A] text-demo-text-invert"
                              )}
                              onClick={handleGetUSDC}
                              disabled={isMinting}
                            >
                              {isMinting && <LoadingIcon className="w-4 h-4" />}
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
                      readyToBuyNft && "transform -translate-y-16"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-fg-primary text-sm leading-5">
                        NFT price
                      </span>
                      <span className="text-fg-primary text-sm leading-relaxed">
                        1.00 USDC
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-fg-primary text-sm leading-5">
                        Network fee est.
                      </span>
                      <span className="text-fg-primary text-sm leading-relaxed flex">
                        {isEstimatingGas ? (
                          <div className="inline-block w-12 h-6 bg-gray-200 rounded animate-pulse" />
                        ) : networkFee === 0 ? (
                          "-"
                        ) : networkFee < 0.01 ? (
                          "< 0.01"
                        ) : (
                          networkFee.toFixed(2)
                        )}
                        &nbsp;USDC
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-fg-primary font-bold">Total</span>
                      <span className="text-fg-primary font-bold">
                        {networkFee === 0 ? "~" : ""}
                        {(nftPrice + networkFee).toFixed(2)}&nbsp;USDC
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {(isMintingNft || mintNftTxHash) && (
                <div className="md:w-1/2 flex flex-col justify-center">
                  <MintStages
                    status={{
                      signing: "success",
                      gas: "success",
                      batch: !mintNftTxHash ? "loading" : "success",
                    }}
                    transactionUrl={`${chain.blockExplorers?.default?.url}/tx/${mintNftTxHash}`}
                    stageDescriptions={[
                      "Invisibly signing transactions",
                      "Paying gas with USDC",
                      "Buying NFT",
                    ]}
                  />
                </div>
              )}
            </div>

            {/* Buy Button */}
            <ModalCTAButton
              onClick={handleBuyNFT}
              isLoading={isMintingNft || isLoadingNftClient}
              loadingText={isLoadingNftClient ? "Loading Client..." : "Buy NFT"}
              disabled={!buyNftButtonEnabled && !mintNftTxHash}
              variant={mintNftTxHash ? "secondary" : "primary"}
              icon={
                !isMintingNft ? (
                  <BagIcon className="w-4 h-4" color={bagIconColor} />
                ) : undefined
              }
            >
              {mintNftTxHash ? "Buy NFT again" : "Buy NFT"}
            </ModalCTAButton>
          </div>
        </DynamicHeight>
      </div>
    </Dialog>
  );
}
