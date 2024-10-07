"use client";
import { useConfig } from "@/app/state";
import { useToast } from "@/hooks/useToast";
import { AccountKitNftMinterABI, nftContractAddress } from "@/utils/config";
import {
  useSendUserOperation,
  useSmartAccountClient,
} from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useCallback, useState } from "react";
import { encodeFunctionData } from "viem";
import { CheckIcon } from "../icons/check";
import { DrawIcon } from "../icons/draw";
import { ExternalLinkIcon } from "../icons/external-link";
import { GasIcon } from "../icons/gas";
import { LoadingIcon } from "../icons/loading";
import { ReceiptIcon } from "../icons/receipt";

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
  const { data: uri } = useQuery({
    queryKey: ["contractURI", nftContractAddress],
    queryFn: async () => {
      const uri = await client?.readContract({
        address: nftContractAddress,
        abi: AccountKitNftMinterABI,
        functionName: "baseURI",
      });
      console.log("uri", uri);
      return uri;
    },
    enabled: !!client && !!client?.readContract,
  });

  return (
    <div className="flex bg-bg-surface-default radius-1 border-btn-secondary border-2 overflow-hidden h-[532px]">
      <div className="px-10 py-12 h-full w-[428px]">
        <h1 className="text-3xl font-semibold  leading-10 mb-8 text-fg-primary">
          {!nftTransfered ? "One-click checkout" : "You collected your NFT!"}
        </h1>
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
      <div className={`px-10 py-12 h-full bg-bg-surface-inset`}>
        <h3 className="text-fg-secondary text-base font-semibold mb-4">
          NFT Summary
        </h3>
        {uri ? (
          <div className="relative">
            {nftTransfered && (
              <div className="absolute top-4 left-4 py-1 px-2 bg-[#F0FDF4] text-[#15803D] radius-1 text-xs font-semibold">
                Collected
              </div>
            )}
            <Image
              width="216"
              height="216"
              src={uri}
              alt="An NFT"
              className="mb-4 rounded-xl"
              priority
            />
          </div>
        ) : (
          <div className="w-[216px] h-[216px] flex justify-center items-center mb-4">
            <LoadingIcon />
          </div>
        )}
        <div
          className={`flex justify-between ${nftTransfered ? "mb-3" : "mb-14"}`}
        >
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
        {!nftTransfered ? (
          <button
            className="btn btn-primary w-full p-2 radius mb-4"
            disabled={
              Object.values(status).some((x) => x === "loading") ||
              isLoadingClient
            }
            onClick={handleCollectNFT}
          >
            Collect NFT
          </button>
        ) : (
          <div>
            <a
              href={`${client?.chain?.blockExplorers?.default.url}?q=${sendUserOperationResult?.hash}`}
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
          </div>
        )}
        <a
          href="https://accountkit.alchemy.com/react/quickstart"
          className=" btn-link flex justify-center text-sm font-semibold"
          target="_blank"
          rel="noreferrer"
        >
          View docs
        </a>
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
    <div className="flex gap-3 mb-10">
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
