"use client";

import { LoadingIcon } from "@/components/icons/loading";
import { AccountKitNftMinterABI, nftContractAddress } from "@/utils/config";
import { useSmartAccountClient } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

type NFTProps = {
  nftTransfered: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function NFT({ nftTransfered, ...props }: NFTProps) {
  const { client } = useSmartAccountClient({ type: "LightAccount" });
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
    <div {...props}>
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
    </div>
  );
}
