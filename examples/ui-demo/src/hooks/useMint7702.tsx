import { useQuery } from "@tanstack/react-query";
import { AccountKitNftMinterABI } from "@/utils/config";
import { useCallback, useState, useMemo } from "react";
import { useToast } from "@/hooks/useToast";
import { Address, encodeFunctionData, Hash } from "viem";
import { MintStatus } from "@/components/small-cards/MintCard";
import { UseMintReturn } from "./useMintDefault";
import { useMAv2Client } from "./useMAv2Client";
import { odyssey, splitOdysseyTransport } from "./7702/transportSetup";

const initialValuePropState = {
  signing: "initial",
  gas: "initial",
  batch: "initial",
} satisfies MintStatus;

export const useMint7702 = (props: {
  contractAddress: Address;
}): UseMintReturn => {
  const { client, isLoadingClient } = useMAv2Client({
    mode: "7702",
    chain: odyssey,
    transport: splitOdysseyTransport,
  });

  const [status, setStatus] = useState<MintStatus>(initialValuePropState);
  const [mintStarted, setMintStarted] = useState(false);
  const [txnHash, setTxnHash] = useState<Hash | undefined>(undefined);
  const isLoading =
    Object.values(status).some((x) => x === "loading") || isLoadingClient;
  const { setToast } = useToast();

  const { data: uri } = useQuery({
    queryKey: ["contractURI", props.contractAddress],
    queryFn: async () => {
      const uri = await client?.readContract({
        address: props.contractAddress,
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
      setTxnHash(txnHash);

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

    setTxnHash(undefined);
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
        target: props.contractAddress,
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
  }, [client, props.contractAddress, setToast]);

  const transactionUrl = useMemo(() => {
    if (!client?.chain?.blockExplorers || !txnHash) {
      return undefined;
    }
    return `${client.chain.blockExplorers.default.url}/tx/${txnHash}`;
  }, [client?.chain.blockExplorers, txnHash]);

  return {
    isLoading,
    status,
    mintStarted,
    handleCollectNFT,
    uri,
    transactionUrl,
  };
};
