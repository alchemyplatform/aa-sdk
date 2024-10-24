"use client";

import { ChevronDown } from "@/components/icons/chevron-down";
import { LoadingIcon } from "@/components/icons/loading";
import { cn } from "@/lib/utils";
import { AccountKitNftMinterABI, nftContractAddress } from "@/utils/config";
import { Dialog, useSmartAccountClient } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { ValueProps } from "./ValueProps";
import { MintStatus } from "./MintCard";
import { ExternalLinkIcon } from "@/components/icons/external-link";
import { useBreakpoint } from "@/hooks/useBreakpoint";

type NFTProps = {
  nftTransfered: boolean;
  transactionUrl?: string;
  status: MintStatus;
} & React.HTMLAttributes<HTMLDivElement>;

const NFT_MOBILE_SIZE = 288;

const afterBoarder =
  "after:absolute after:bottom-[-16px] after:left-0 after:w-full after:h-[1px] after:bg-border xl:after:hidden";

export function NFT({
  nftTransfered,
  transactionUrl,
  status,
  ...props
}: NFTProps) {
  const { client } = useSmartAccountClient({ type: "LightAccount" });
  const [mobileTrayOpen, setMobileTrayOpen] = useState(false);
  const breakpoint = useBreakpoint();
  const { data: uri } = useQuery({
    queryKey: ["contractURI", nftContractAddress],
    queryFn: async () => {
      const uri = await client?.readContract({
        address: nftContractAddress,
        abi: AccountKitNftMinterABI,
        functionName: "baseURI",
      });
      return uri;
    },
    enabled: !!client && !!client?.readContract,
  });
  return (
    <div {...props} className="flex flex-col items-center">
      <h3 className="hidden xl:block text-fg-secondary text-base font-semibold mb-4 w-full text-start">
        NFT Summary
      </h3>
      <h1 className="block xl:hidden text-fg-primary text-3xl font-semibold mb-6">
        {nftTransfered ? "You collected your NFT!" : "One-click checkout"}
      </h1>
      {uri ? (
        <div className="relative flex flex-col items-center">
          {nftTransfered && (
            <div className="absolute top-4 left-4 py-1 px-2 bg-[#F0FDF4] text-[#15803D] radius-1 text-xs font-semibold">
              Collected
            </div>
          )}
          <Image
            width={NFT_MOBILE_SIZE}
            height={NFT_MOBILE_SIZE}
            src={uri}
            alt="An NFT"
            className={cn(`mb-4 rounded-xl xl:h-[180px] xl:w-[180px]`)}
            priority
          />
        </div>
      ) : (
        <div className="w-72 h-72 xl:h-[180px] xl:w-[180px] flex justify-center items-center mb-4">
          <LoadingIcon />
        </div>
      )}
      <div
        className={cn(
          `flex justify-between w-72 xl:w-[180px] relative xl:after:hidden  mb-8 ${afterBoarder}`,
          nftTransfered ? "xl:mb-3" : "xl:mb-14"
        )}
      >
        <p className="text-fg-secondary text-base">Gas Fee</p>
        <p>
          <span className="line-through mr-1 text-base text-fg-primary align-top">
            $0.02
          </span>
          <span
            className="text-base align-top"
            style={{
              background: "linear-gradient(132deg, #FF9C27 0%, #FD48CE 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Free
          </span>
        </p>
      </div>
      {nftTransfered && transactionUrl && (
        <a
          href={transactionUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(
            `relative text-fg-secondary mb-8 w-72 xl:w-[180px]  flex justify-between items-center ${afterBoarder} `
          )}
        >
          View transaction
          <div className="w-4 h-4">
            <ExternalLinkIcon className="stroke-fg-secondary" />
          </div>
        </a>
      )}
      <button
        className="text-fg-secondary text-base flex justify-between items-center w-72 xl:hidden"
        onClick={() => setMobileTrayOpen((prev) => !prev)}
      >
        How it works{" "}
        <ChevronDown
          className={cn(`w-5 h-5 px-1 stroke-fg-primary`, {
            "rotate-180": mobileTrayOpen,
          })}
        />
      </button>
      {mobileTrayOpen && (
        <div className="w-72 py-4 xl:hidden">
          <ValueProps status={status} />{" "}
        </div>
      )}
      {breakpoint === "sm" && (
        <Dialog
          isOpen={mobileTrayOpen}
          onClose={() => setMobileTrayOpen(false)}
        >
          <div className="bg-bg-surface-default rounded-t-[16px] p-6">
            <p className="text-fg-primary text-lg font-semibold mb-6">
              How is this working?
            </p>
            <ValueProps status={status} />
          </div>
        </Dialog>
      )}
    </div>
  );
}
