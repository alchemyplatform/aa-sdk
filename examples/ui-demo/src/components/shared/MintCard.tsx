"use client";
import Image from "next/image";
import { CheckIcon } from "../icons/check";
import { GasIcon } from "../icons/gas";
import { DrawIcon } from "../icons/draw";
import { ReceiptIcon } from "../icons/receipt";
import React, { useCallback, useState } from "react";
import { hexToRGBA } from "../../utils/hexToRGBA";
import { LoadingIcon } from "../icons/loading";
import { ExternalLinkIcon } from "../icons/external-link";
import {
  useSendUserOperation,
  useSmartAccountClient,
} from "@account-kit/react";
import { AccountKitNftMinterABI, nftContractAddress } from "@/utils/config";
import { encodeFunctionData } from "viem";

type NFTLoadingState = "loading" | "success";

const initialState = {
  signing: "signing",
  gas: "gas",
  batch: "batch",
} satisfies mintStatus;

type mintStatus = {
  signing: NFTLoadingState | "signing";
  gas: NFTLoadingState | "gas";
  batch: NFTLoadingState | "batch";
};

export const MintCard = () => {
  const [status, setStatus] = useState<mintStatus>(initialState);
  const [hasError, setHasError] = useState(false);
  const [hasCollected, setHasCollected] = useState(false);
  const handleSuccess = () => {
    setStatus((prev) => ({ ...prev, batch: "success" }));
    setHasCollected(true);
  };
  const { client } = useSmartAccountClient({ type: "LightAccount" });
  const handleError = () => {
    setStatus(initialState);
    setHasError(true);
  };
  const {
    sendUserOperationResult,
    // isSendingUserOperation,
    sendUserOperation,
  } = useSendUserOperation({
    client,
    waitForTxn: true,
    onError: handleError,
    onSuccess: handleSuccess,
    onSettled: () => {},
    onMutate: () => {
      console.log("mutation - start loading state");
    },
  });

  const getPrimaryColorRGBA = useCallback(() => {
    if (typeof window === "undefined") return hexToRGBA("#363FF9", 0.1);
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--akui-fg-accent-brand")
      .trim();
    const rgba = hexToRGBA(color, 0.1);
    return rgba;
  }, []);

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
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, signing: "success" }));
        resolve();
      }, 2000);
    });
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, gas: "success" }));
        resolve();
      }, 2000);
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

  return (
    <div className="flex bg-bg-surface-default radius-1 border-btn-secondary overflow-hidden">
      <div className="p-12">
        <h2 className="text-2xl font-semibold tracking-tight leading-10 mb-8 text-fg-primary">
          One-click checkout
        </h2>
        <ValueProp
          title="Invisible signing"
          icon={status.signing}
          description="Sign actions in the background with embedded wallets"
        />

        <ValueProp
          title="Gas sponsorship"
          icon={status.gas}
          description={
            <span>
              Sponsor gas fees to remove barriers to adoption. <a>Learn how.</a>
            </span>
          }
        />
        <ValueProp
          title="Batch transactions"
          icon={status.batch}
          description="Deploy the user's smart account in their first transaction"
        />
      </div>
      <div className={`p-12`} style={{ background: getPrimaryColorRGBA() }}>
        <h3 className="text-fg-secondary text-base font-semibold mb-4">
          NFT Summary
        </h3>
        <Image
          width="277"
          height="255"
          src="/images/NFT.png"
          alt="An NFT"
          className="mb-4"
        />
        <div className="flex justify-between mb-8">
          <p className="text-fg-secondary text-sm">Gas Fee</p>
          <p>
            <span className="line-through mr-1 text-sm text-fg-primary align-top">
              $0.02
            </span>
            <span
              className="text-sm align-top"
              style={{
                background:
                  "linear-gradient(126deg, #36BEFF 4.59%, #733FF1 108.32%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Free
            </span>
          </p>
        </div>
        {!hasCollected ? (
          <button
            className="btn btn-primary w-full p-2 radius"
            disabled={Object.values(status).some((x) => x === "loading")}
            onClick={handleCollectNFT}
          >
            Collect NFT
          </button>
        ) : (
          <div>
            <a
              href={`https://sepolia.arbiscan.io/block/${sendUserOperationResult?.hash}`}
              target="_blank"
              rel="noreferrer"
              className="text-fg-secondary mb-6 flex justify-between items-center"
            >
              View on arbiscan
              <div className="w-5 h-5">
                <ExternalLinkIcon className="text-fg-primary" />
              </div>
            </a>
            <a
              href="https://dashboard.alchemy.com/"
              className="btn btn-primary flex text-center mb-4 p-2"
              target="_blank"
              rel="noreferrer"
            >
              Build with Account Kit
            </a>
            <a
              href="https://accountkit.alchemy.com/react/quickstart"
              className="btn btn-secondary flex text-center p-2"
              target="_blank"
              rel="noreferrer"
            >
              View docs
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const ValueProp = ({
  icon,
  title,
  description,
}: {
  icon: "signing" | "gas" | "batch" | "loading" | "success";
  title: string;
  description: string | JSX.Element;
}) => {
  return (
    <div className="flex gap-3 mb-8">
      {getMintIcon(icon)}
      <div className=" max-w-[308px]">
        <h3 className="text-base font-semibold text-fg-secondary">{title}</h3>
        <p className="text-base leading-6 text-fg-secondary">{description}</p>
      </div>
    </div>
  );
};

const getMintIcon = (
  icon: "signing" | "gas" | "batch" | "loading" | "success"
) => {
  switch (icon) {
    case "signing":
      return <DrawIcon className="text-fg-secondary" />;
    case "gas":
      return <GasIcon className="text-fg-secondary" />;
    case "batch":
      return <ReceiptIcon className="text-fg-secondary" />;
    case "loading":
      return <LoadingIcon />;
    case "success":
      return <CheckIcon stroke="#16A34A" />;
  }
};
