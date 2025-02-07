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
          <span className={"inline-block lg:hidden"}>
            {`You've collected your NFT!`}
          </span>
          <span className={"hidden lg:inline-block"}>
            {`You've successfully collected your NFT! Refresh to mint
						again.`}
          </span>
        </>
      ),
      open: true,
    });
    setNFTTransfered(true);
  };
  const handleError = (error: Error) => {
    console.error(error);
    setStatus(initialValuePropState);
    setToast({
      type: "error",
      text: "There was a problem with that action",
      open: true,
    });
  };

  const { client, isLoadingClient } = useSmartAccountClient({
    type: "ModularAccountV2",
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
    <div className="flex mt-0 lg:justify-center flex-col lg:h-full mb-6">
      <div className="lg:self-center">
        <div className="flex items-center flex-col justify-center mb-12 lg:mb-0  lg:flex-row lg:justify-center lg:items-start bg-bg-surface-default radius-1 border-btn-secondary border md:mx-6 lg:mx-0 overflow-hidden lg:h-[470px] border-none lg:border-solid">
          <div className="hidden lg:block max-w-[410px] overflow-auto p-8 h-full">
            <h1 className="text-3xl lg:text-2xl font-semibold text-center leading-10 mb-8 text-fg-primary">
              {!nftTransfered
                ? "One-click checkout"
                : "You collected your NFT!"}
            </h1>
            <ValueProps status={status} />
          </div>
          <div
            className={`p-6 lg:p-8 h-full bg-bg-surface-default  lg:bg-bg-surface-inset`}
          >
            <NFT
              nftTransfered={nftTransfered}
              transactionUrl={transactionUrl}
              status={status}
            />
            <MintCardActionButtons
              className="lg:pt-0 lg:w-[180px] m-auto"
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
