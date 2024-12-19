import { useSmartAccountClient } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import { AccountKitNftMinterABI, nftContractAddress } from "@/utils/config";
import { useCallback, useState } from "react";
import Image from "next/image";
import { LoadingIcon } from "@/components/icons/loading";
import { Button } from "./Button";
import { useToast } from "@/hooks/useToast";
import { useSendUserOperation } from "@account-kit/react";
import { encodeFunctionData } from "viem";
import { MintStages } from "./MintStages";

const initialValuePropState = {
  signing: "initial",
  gas: "initial",
  batch: "initial",
} satisfies MintStatus;

type NFTLoadingState = "initial" | "loading" | "success";
export type MintStatus = {
  signing: NFTLoadingState;
  gas: NFTLoadingState;
  batch: NFTLoadingState;
};

export const MintCard7702 = () => {
  const [status, setStatus] = useState<MintStatus>(initialValuePropState);
  const [nftTransfered, setNftTransfered] = useState(false);
  const isLoading = Object.values(status).some((x) => x === "loading");
  const { setToast } = useToast();
  const { client } = useSmartAccountClient({ type: "LightAccount" });
  const handleSuccess = () => {
    setStatus(() => ({
      batch: "success",
      gas: "success",
      signing: "success",
    }));
    setToast({
      type: "success",
      text: (
        <>
          <span className={"inline-block lg:hidden"}>
            {`You've collected your NFT!`}
          </span>
          <span className={"hidden lg:inline-block"}>
            {`You've successfully collected your NFT! Refresh to mint
						again.`}
          </span>
        </>
      ),
      open: true,
    });
  };

  const handleError = (error: Error) => {
    console.error(error);
    setStatus(initialValuePropState);
    setNftTransfered(false);
    setToast({
      type: "error",
      text: "There was a problem with that action",
      open: true,
    });
  };

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
    setNftTransfered(true);

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
