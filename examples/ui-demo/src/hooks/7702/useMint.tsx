import { useQuery } from "@tanstack/react-query";
import {
  AccountKitNftMinterABI,
  nftContractAddressOdyssey,
} from "@/utils/config";
import { ODYSSEY_EXPLORER_URL } from "./constants";
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { encodeFunctionData, Hash } from "viem";
import { useSma7702Client } from "./useSma7702Client";
import { MintStatus } from "@/components/7702/MintCard7702";

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

  const client = useSma7702Client();

  const { data: uri } = useQuery({
    queryKey: ["contractURI", nftContractAddressOdyssey],
    queryFn: async () => {
      const uri = await client?.readContract({
        address: nftContractAddressOdyssey,
        abi: AccountKitNftMinterABI,
        functionName: "baseURI",
      });
      return uri;
    },
    enabled: !!client && !!client?.readContract,
  });

  const handleCollectNFT = useCallback(async () => {
    const handleSuccess = (txnHash: Hash) => {
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

    setTimeout(() => {
      setStatus((prev) => ({ ...prev, signing: "success" }));
    }, 500);
    setTimeout(() => {
      setStatus((prev) => ({ ...prev, gas: "success" }));
    }, 750);

    const uoHash = await client.sendUserOperation({
      uo: {
        target: nftContractAddressOdyssey,
        data: encodeFunctionData({
          abi: AccountKitNftMinterABI,
          functionName: "mintTo",
          args: [client.getAddress()],
        }),
      },
    });

    const txnHash = await client
      .waitForUserOperationTransaction(uoHash)
      .catch((e) => {
        handleError(e);
      });

    if (txnHash) {
      handleSuccess(txnHash);
    }
  }, [client, setToast]);

  return {
    isLoading,
    status,
    nftTransfered,
    handleCollectNFT,
    uri,
  };
};
