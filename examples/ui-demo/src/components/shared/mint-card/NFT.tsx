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
import { initialValuePropState } from "./MintCard";
import { ExternalLinkIcon } from "@/components/icons/external-link";

type NFTProps = {
  nftTransfered: boolean;
  transactionUrl?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const NFT_MOBILE_SIZE = 288;

const afterBoarder =
  "after:absolute after:bottom-[-16px] after:left-0 after:w-full after:h-[1px] after:bg-border";

export function NFT({ nftTransfered, transactionUrl, ...props }: NFTProps) {
  const { client } = useSmartAccountClient({ type: "LightAccount" });
  const [mobileTrayOpen, setMobileTrayOpen] = useState(false);
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
    <div {...props} className="flex flex-col items-center">
      <h3 className="hidden md:block text-fg-secondary text-base font-semibold mb-4">
        NFT Summary
      </h3>
      <h1 className="block md:hidden text-fg-primary text-3xl font-semibold mb-6">
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
            className={cn(`mb-4 rounded-xl md:h-52 md:w-52`)}
            priority
          />
        </div>
      ) : (
        <div className="w-72 h-72 md:h-52 md:w-52 flex justify-center items-center mb-4">
          <LoadingIcon />
        </div>
      )}
      <div
        className={cn(
          `flex justify-between w-72 md:w-52 relative md:after:hidden  mb-8 ${afterBoarder}`,
          nftTransfered ? "md:mb-3" : "md:mb-14"
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
      {nftTransfered && transactionUrl && (
        <a
          href={transactionUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(
            `relative text-fg-secondary mb-8 w-72  flex justify-between items-center ${afterBoarder} md:hidden`
          )}
        >
          View transaction
          <div className="w-4 h-4">
            <ExternalLinkIcon className="text-fg-secondary" />
          </div>
        </a>
      )}
      <button
        className="text-fg-secondary text-base flex justify-between items-center w-72"
        onClick={() => setMobileTrayOpen(true)}
      >
        How is this working?{" "}
        <ChevronDown
          className={cn(`w-5 h-5 px-1`, {
            "rotate-180": mobileTrayOpen,
          })}
        />
      </button>
      <Dialog isOpen={mobileTrayOpen} onClose={() => setMobileTrayOpen(false)}>
        <div className="bg-bg-surface-default rounded-t-[16px] p-6">
          <p className="text-fg-primary text-lg font-semibold mb-6">
            How is this working?
          </p>
          <ValueProps status={initialValuePropState} />
        </div>
      </Dialog>
    </div>
  );
}
