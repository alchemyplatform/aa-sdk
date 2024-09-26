"use client";
import Image from "next/image";
import { CheckIcon } from "../icons/check";
import { GasIcon } from "../icons/gas";
import { DrawIcon } from "../icons/draw";
import { ReceiptIcon } from "../icons/receipt";
import React, { useCallback, useEffect, useState } from "react";
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
} satisfies MintStatus;

type MintStatus = {
  signing: NFTLoadingState | "signing";
  gas: NFTLoadingState | "gas";
  batch: NFTLoadingState | "batch";
};

export const MintCard = () => {
  const [status, setStatus] = useState<MintStatus>(initialState);
  // To be wired into the toast pr
  const [hasError, setHasError] = useState(false);
  const [hasCollected, setHasCollected] = useState(false);
  const [uri, setURI] = useState<string | null>();

  const handleSuccess = () => {
    setStatus(() => ({
      batch: "success",
      gas: "success",
      signing: "success",
    }));
    setHasCollected(true);
  };
  const handleError = () => {
    setStatus(initialState);
    setHasError(true);
  };

  const getPrimaryColorRGBA = useCallback(() => {
    if (typeof window === "undefined") return hexToRGBA("#363FF9", 0.1);
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--akui-fg-accent-brand")
      .trim();
    const rgba = hexToRGBA(color, 0.1);
    return rgba;
  }, []);

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

  const getContractURI = async () => {
    const uri = await client?.readContract({
      address: nftContractAddress,
      abi: AccountKitNftMinterABI,
      functionName: "baseURI",
    });
    setURI(uri);
  };

  useEffect(() => {
    if (!uri) {
      getContractURI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.readContract]);

  return (
    <div className="flex bg-bg-surface-default radius-1 border-btn-secondary overflow-hidden min-h-[630px]">
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
              Sponsor gas fees to remove barriers to adoption.{" "}
              <a
                href="https://accountkit.alchemy.com/react/sponsor-gas"
                target="_blank"
                referrerPolicy="no-referrer"
                className="font-medium"
              >
                Learn how.
              </a>
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
        {uri ? (
          <Image
            width="277"
            height="255"
            src={uri}
            alt="An NFT"
            className="mb-4"
          />
        ) : (
          <div className="w-[277px] h-[255px] flex justify-center items-center mb-4">
            <LoadingIcon />
          </div>
        )}
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
              View transaction
              <div className="w-4 h-4">
                <ExternalLinkIcon className="text-fg-secondary" />
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
