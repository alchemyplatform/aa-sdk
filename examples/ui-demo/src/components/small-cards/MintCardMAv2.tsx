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

export const MintCardMAv2 = ({
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
    <div className="bg-bg-surface-default rounded-lg p-4 xl:p-6 w-full xl:w-[326px] xl:h-[478px] flex flex-col shadow-smallCard">
      <div className="flex xl:flex-col gap-4">
        <div className="flex-shrink-0 sm:mb-3 xl:mb-0 rounded-lg overflow-hidden relative flex items-center justify-center h-[67px] w-[60px] sm:h-[154px] sm:w-[140px] xl:h-[222px] xl:w-full">
          {uri ? (
            <Image
              width={326}
              height={222}
              src={uri}
              alt="An NFT"
              priority
              className="object-cover h-full w-full"
            />
          ) : (
            <LoadingIcon />
          )}
        </div>
        <div>
          <div className="mb-2">
            <h3 className="text-fg-primary text-base xl:text-xl font-semibold">
              Gasless transactions
            </h3>
          </div>
          {!nftTransfered ? (
            <>
              <p className="text-fg-primary text-sm mb-3">
                Transact with one click using gas sponsorship and background
                signing.
              </p>
              <div className="justify-between items-center hidden xl:flex">
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
        </div>
      </div>
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
