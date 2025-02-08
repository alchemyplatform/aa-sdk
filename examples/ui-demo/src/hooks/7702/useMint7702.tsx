import { useQuery } from "@tanstack/react-query";
import {
  AccountKitNftMinterABI,
  nftContractAddressOdyssey,
} from "@/utils/config";
import { useCallback, useState, useMemo } from "react";
import { useToast } from "@/hooks/useToast";
import { encodeFunctionData, Hash } from "viem";
import { MintStatus } from "@/components/small-cards/MintCard";
import { useSma7702Client } from "./useSma7702Client";

const initialValuePropState = {
  signing: "initial",
  gas: "initial",
  batch: "initial",
} satisfies MintStatus;

export const useMint7702 = () => {
  const { client, isLoadingClient } = useSma7702Client();

  const [status, setStatus] = useState<MintStatus>(initialValuePropState);
  const [mintStarted, setMintStarted] = useState(false);
  const isLoading =
    Object.values(status).some((x) => x === "loading") || isLoadingClient;
  const { setToast } = useToast();
  const [hash, setHash] = useState<Hash | undefined>();

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

      setHash(txnHash);

      setToast({
        type: "success",
        text: (
          <>
            <span className={"inline-block lg:hidden"}>
              {`You've collected your NFT!`}
            </span>
            <span className={"hidden lg:inline-block"}>
              {`You've successfully collected your NFT!`}
            </span>
          </>
        ),
        open: true,
      });
    };

    const handleError = (error: Error) => {
      console.error(error);
      setStatus(initialValuePropState);
      setMintStarted(false);
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

    setHash(undefined);
    setMintStarted(true);

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

  const transactionUrl = useMemo(() => {
    if (!client?.chain?.blockExplorers || !hash) {
      return undefined;
    }
    return `${client.chain.blockExplorers.default.url}/tx/${hash}`;
  }, [client, hash]);

  return {
    isLoading,
    status,
    mintStarted,
    handleCollectNFT,
    uri,
    transactionUrl,
  };
};
