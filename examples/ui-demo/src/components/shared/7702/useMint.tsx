import {
  useSendUserOperation,
  useSmartAccountClient,
} from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import { AccountKitNftMinterABI, nftContractAddress } from "@/utils/config";
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { encodeFunctionData } from "viem";
import { MintStatus } from "./MintCard7702";

const initialValuePropState = {
  signing: "initial",
  gas: "initial",
  batch: "initial",
} satisfies MintStatus;

export const useMint = () => {
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
    // Current design does not have a success toast, leaving commented to implement later.
    // setToast({
    //   type: "success",
    //   text: (
    //     <>
    //       <span className={"inline-block lg:hidden"}>
    //         {`You've collected your NFT!`}
    //       </span>
    //       <span className={"hidden lg:inline-block"}>
    //         {`You've successfully collected your NFT! Refresh to mint
    //                       again.`}
    //       </span>
    //     </>
    //   ),
    //   open: true,
    // });
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
  const { sendUserOperation } = useSendUserOperation({
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

  return {
    isLoading,
    status,
    nftTransfered,
    handleCollectNFT,
    uri,
  };
};
