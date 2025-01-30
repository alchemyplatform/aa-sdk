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
  isDisabled,
  status,
  nftTransfered,
  handleCollectNFT,
  uri,
}: {
  isLoading: boolean;
  isDisabled?: boolean;
  status: MintStatus;
  nftTransfered: boolean;
  handleCollectNFT: () => void;
  uri?: string;
}) => {
  return (
    <div className="bg-bg-surface-default rounded-lg p-6 w-[326px] h-[478px] flex flex-col shadow-smallCard ">
      {uri ? (
        <div className="relative flex flex-col items-center">
          <Image
            className="mb-4 rounded-xl object-cover h-[222px] w-[326px]"
            width={326}
            height={222}
            src={uri}
            alt="An NFT"
            priority
          />
        </div>
      ) : (
        <div className="flex justify-center items-center h-[222px] w-full mb-4">
          <LoadingIcon />
        </div>
      )}
      <div className="mb-3">
        <h3 className="text-fg-primary text-xl font-semibold">
          Gasless transactions
        </h3>
      </div>
      {!nftTransfered ? (
        <>
          <p className="text-fg-primary text-sm mb-3">
            Sponsor gas and sign in the background for a one-click transaction
            experience.
          </p>
          <div className="flex justify-between items-center">
            <p className="text-fg-secondary text-base">Gas Fee</p>
            <p>
              <span className="line-through mr-1 text-base text-fg-primary align-top">
                $0.02
              </span>
              <span
                className="text-base align-top"
                style={{
                  background:
                    "linear-gradient(132deg, #FF9C27 0%, #FD48CE 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Free
              </span>
            </p>
          </div>
        </>
      ) : (
        <MintStages status={status} />
      )}
      <Button
        className="w-full mt-auto"
        onClick={handleCollectNFT}
        disabled={isLoading || isDisabled}
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
