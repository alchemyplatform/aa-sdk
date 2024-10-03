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

type NFTLoadingState = "loading" | "success";

const initialState = {
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
  const [status, setStatus] = useState<MintStatus>(initialState);
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
    setStatus(initialState);
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
    <div className="flex bg-bg-surface-default radius-1 border-btn-secondary border-2 overflow-hidden h-[532px]">
      <div className="px-10 py-12 h-full w-[428px]">
        <h1 className="text-3xl font-semibold  leading-10 mb-8 text-fg-primary">
          {!nftTransfered ? "One-click checkout" : "You collected your NFT!"}
        </h1>
        <ValueProps status={status} />
      </div>
      <div className={`px-10 py-12 h-full bg-bg-surface-inset`}>
        <NFT nftTransfered={nftTransfered} />
        <MintCardActionButtons
          nftTransfered={nftTransfered}
          handleCollectNFT={handleCollectNFT}
          status={status}
          transactionUrl={transactionUrl}
        />
      </div>
    </div>
  );
};
