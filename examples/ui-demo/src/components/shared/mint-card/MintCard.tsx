"use client";

import { useCallback, useState } from "react";

import { useToast } from "@/hooks/useToast";
import { useConfigStore } from "@/state";
import { AccountKitNftMinterABI, nftContractAddress } from "@/utils/config";
import {
  useSendUserOperation,
  useSmartAccountClient,
} from "@account-kit/react";
import { encodeFunctionData } from "viem";
import { RenderUserConnectionAvatar } from "../user-connection-avatar/RenderUserConnectionAvatar";
import { MintCardActionButtons } from "./MintCardActionButtons";
import { NFT } from "./NFT";
import { ValueProps } from "./ValueProps";

type NFTLoadingState = "loading" | "success";

const initialValuePropState = {
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
  const { nftTransferred: nftTransfered, setNFTTransferred: setNFTTransfered } =
    useConfigStore((state) => ({
      nftTransferred: state.nftTransferred,
      setNFTTransferred: state.setNftTransferred,
    }));

  const handleSuccess = () => {
    setStatus(() => ({
      batch: "success",
      gas: "success",
      signing: "success",
    }));
    setToast({
      type: "success",
      text: (
        <>
          <span className={"inline-block xl:hidden"}>
            {`You've collected your NFT!`}
          </span>
          <span className={"hidden xl:inline-block"}>
            {`You've successfully collected your NFT! Refresh to mint
						again.`}
          </span>
        </>
      ),
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

  const { client, isLoadingClient } = useSmartAccountClient({
    type: "LightAccount",
  });
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
  const transactionUrl = `${client?.chain?.blockExplorers?.default.url}/tx/${sendUserOperationResult?.hash}`;

  const isActionButtonsDisabled =
    Object.values(status).some((x) => x === "loading") || isLoadingClient;

  return (
    <div className="flex mt-0 xl:mt-7 pb-10 xl:pb-0 xl:justify-center flex-col xl:h-full">
      <div className="xl:self-center">
        <div className="flex items-center flex-col justify-center mb-12 xl:mb-0  xl:flex-row xl:justify-center xl:items-start bg-bg-surface-default radius-1 border-btn-secondary border md:mx-6 xl:mx-0 overflow-hidden xl:h-[470px]">
          <RenderUserConnectionAvatar className="xl:hidden w-full p-6 mb-0 pb-6 relative after:absolute after:bottom-0 after:left-6 after:right-6  after:h-[1px] after:bg-border" />
          <div className="hidden xl:block min-w-[410px] p-8 h-full">
            <h1 className="text-3xl font-semibold  leading-10 mb-8 text-fg-primary">
              {!nftTransfered
                ? "One-click checkout"
                : "You collected your NFT!"}
            </h1>
            <ValueProps status={status} />
          </div>
          <div
            className={`p-6 xl:p-8 h-full bg-bg-surface-default  xl:bg-bg-surface-inset`}
          >
            <NFT
              nftTransfered={nftTransfered}
              transactionUrl={transactionUrl}
              status={status}
            />
            <MintCardActionButtons
              className="pt-20 xl:pt-0 xl:w-[180px] m-auto"
              nftTransfered={nftTransfered}
              handleCollectNFT={handleCollectNFT}
              disabled={isActionButtonsDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
