"use client";

import React, { useCallback, useState } from "react";

import {
  useSendUserOperation,
  useSmartAccountClient,
} from "@account-kit/react";
import { AccountKitNftMinterABI, nftContractAddress } from "@/utils/config";
import { encodeFunctionData } from "viem";
import { useConfig } from "@/app/state";
import { useToast } from "@/hooks/useToast";
import { NFT } from "./NFT";
import { MintCardActionButtons } from "./MintCardActionButtons";
import { ValueProps } from "./ValueProps";
import { RenderUserConnectionAvatar } from "../user-connection-avatar/RenderUserConnectionAvatar";

type NFTLoadingState = "loading" | "success";

export const initialValuePropState = {
  signing: "signing",
  gas: "gas",
  batch: "batch",
} satisfies MintStatus;

export type MintStatus = {
  signing: NFTLoadingState | "signing";
  gas: NFTLoadingState | "gas";
  batch: NFTLoadingState | "batch";
};

export const MintCard = () => {
  const [status, setStatus] = useState<MintStatus>(initialValuePropState);
  const { setToast } = useToast();
  const { nftTransfered, setNFTTransfered } = useConfig();
  const handleSuccess = () => {
    setStatus(() => ({
      batch: "success",
      gas: "success",
      signing: "success",
    }));
    setToast({
      type: "success",
      text: "You've successfully collected your NFT! Refresh to mint again.",
      open: true,
    });
    setNFTTransfered(true);
  };
  const handleError = () => {
    setStatus(initialValuePropState);
    setToast({
      type: "error",
      text: "There was a problem with that action",
      open: true,
    });
  };

  const { client } = useSmartAccountClient({ type: "LightAccount" });
  const { sendUserOperationResult, sendUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    onError: handleError,
    onSuccess: handleSuccess,
    onMutate: () => {
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, signing: "success" }));
      }, 500);
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, gas: "success" }));
      }, 750);
    },
  });

  const handleCollectNFT = useCallback(async () => {
    if (!client) {
      console.error("no client");
      return;
    }
    setStatus({
      signing: "loading",
      gas: "loading",
      batch: "loading",
    });
    sendUserOperation({
      uo: {
        target: nftContractAddress,
        data: encodeFunctionData({
          abi: AccountKitNftMinterABI,
          functionName: "mintTo",
          args: [client.getAddress()],
        }),
      },
    });
  }, [client, sendUserOperation]);
  const transactionUrl = `${client?.chain?.blockExplorers?.default.url}?q=${sendUserOperationResult?.hash}`;

  return (
    <div className="flex pb-10 md:pb-0 md:block flex-col h-full">
      <div className="flex items-center flex-col justify-center mb-12 md:mb-0  md:flex-row md:justify-normal md:items-start bg-bg-surface-default radius-1 border-btn-secondary border-[1px] overflow-hidden md:h-[532px]">
        <RenderUserConnectionAvatar className="md:hidden w-full p-6 mb-0 pb-6 relative after:absolute after:bottom-0 after:left-6 after:right-6  after:h-[1px] after:bg-border" />
        <div className="hidden md:flex px-10 py-12 h-full w-[428px]">
          <h1 className="text-3xl font-semibold  leading-10 mb-8 text-fg-primary">
            {!nftTransfered ? "One-click checkout" : "You collected your NFT!"}
          </h1>
          <ValueProps status={status} />
        </div>
        <div
          className={`p-6 md:px-10 md:py-12 h-full bg-white  md:bg-bg-surface-inset`}
        >
          <NFT nftTransfered={nftTransfered} transactionUrl={transactionUrl} />
          <MintCardActionButtons
            className="hidden md:block"
            nftTransfered={nftTransfered}
            handleCollectNFT={handleCollectNFT}
            status={status}
            transactionUrl={transactionUrl}
          />
        </div>
      </div>
      <MintCardActionButtons
        className="md:hidden"
        nftTransfered={nftTransfered}
        handleCollectNFT={handleCollectNFT}
        status={status}
        transactionUrl={transactionUrl}
      />
    </div>
  );
};
