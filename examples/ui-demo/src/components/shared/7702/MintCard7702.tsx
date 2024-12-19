import Image from "next/image";
import { LoadingIcon } from "@/components/icons/loading";
import { Button } from "./Button";
import { MintStages } from "./MintStages";

type NFTLoadingState = "initial" | "loading" | "success";
export type MintStatus = {
  signing: NFTLoadingState;
  gas: NFTLoadingState;
  batch: NFTLoadingState;
};

export const MintCard7702 = ({
  isLoading,
  status,
  nftTransfered,
  handleCollectNFT,
  uri,
}: {
  isLoading: boolean;
  status: MintStatus;
  nftTransfered: boolean;
  handleCollectNFT: () => void;
  uri?: string;
}) => {
  return (
    <div
      className="bg-bg-surface-default rounded-lg p-6 w-[278px] h-[430px] flex flex-col"
      style={{
        boxShadow:
          "0px 50px 50px 0px rgba(0, 0, 0, 0.09), 0px 12px 27px 0px rgba(0, 0, 0, 0.10)",
      }}
    >
      {uri ? (
        <div className="relative flex flex-col items-center">
          <div className="relative w-full h-[170px] overflow-hidden mb-4 rounded-xl">
            <Image
              src={uri}
              alt="An NFT"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-[170px]">
          <LoadingIcon />
        </div>
      )}
      <div className="mb-3">
        <h3 className="text-fg-primary text-xl font-semibold">
          Gasless transactions
        </h3>
        <p className="text-fg-primary text-sm">
          Sponsor gas and sign in the background for a one-click transaction
          experience.
        </p>
      </div>
      {!nftTransfered ? (
        <div className="flex justify-between items-center">
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
      ) : (
        <MintStages status={status} />
      )}
      <Button
        className="w-full mt-auto"
        onClick={handleCollectNFT}
        disabled={isLoading}
      >
        {!nftTransfered
          ? "Collect NFT"
          : isLoading
          ? "Collecting NFT..."
          : "Re-collect NFT"}
      </Button>
    </div>
  );
};
