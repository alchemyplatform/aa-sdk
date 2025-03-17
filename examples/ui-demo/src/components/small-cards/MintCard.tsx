import { nftContractAddress, nftContractAddressOdyssey } from "@/utils/config";
import { useMint } from "@/hooks/useMint";
import { Button } from "./Button";
import { MintStages } from "./MintStages";
import { odyssey } from "@/hooks/7702/transportSetup";
import { arbitrumSepolia } from "@account-kit/infra";
import { Card } from "./Card";
import { LoadingIcon } from "../icons/loading";
import Image from "next/image";
import { AccountMode } from "@/app/config";
type NFTLoadingState = "initial" | "loading" | "success";

export type MintStatus = {
  signing: NFTLoadingState;
  gas: NFTLoadingState;
  batch: NFTLoadingState;
};

export const MintCard = ({ accountMode }: { accountMode: AccountMode }) => {
  const {
    isLoading,
    status,
    mintStarted,
    handleCollectNFT,
    uri,
    transactionUrl,
  } = useMint({
    mode: accountMode === "7702" ? "7702" : "default",
    contractAddress:
      accountMode === "7702" ? nftContractAddressOdyssey : nftContractAddress,
    chain: accountMode === "7702" ? odyssey : arbitrumSepolia,
  });
  const buttonText = !mintStarted
    ? "Collect NFT"
    : isLoading
    ? "Collecting NFT..."
    : "Re-collect NFT";

  const renderContent = (
    <>
      <p className="text-fg-primary text-sm mb-3">
        Transact with one click using gas sponsorship and background signing.
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
    </>
  );

  const image = uri ? (
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
  );

  return (
    <Card
      imageSlot={image}
      heading="Gasless transactions"
      content={
        <>
          {!mintStarted ? (
            renderContent
          ) : (
            <MintStages status={status} transactionUrl={transactionUrl} />
          )}
        </>
      }
      buttons={
        <Button
          className="w-full mt-auto"
          onClick={handleCollectNFT}
          disabled={isLoading}
        >
          {buttonText}
        </Button>
      }
    />
  );
};
