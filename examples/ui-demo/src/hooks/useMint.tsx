import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "./useToast";
import { MintStatus } from "@/components/small-cards/MintCard";
import {
  useSmartAccountClient,
  useSendUserOperation,
  useChain,
} from "@account-kit/react";
import { Address, Chain, encodeFunctionData, Hash } from "viem";
import { AccountKitNftMinterABI } from "@/utils/config";

const initialValuePropState = {
  signing: "initial",
  gas: "initial",
  batch: "initial",
} satisfies MintStatus;

export const useMint = (props: {
  mode: "default" | "7702";
  contractAddress: Address;
  chain: Chain;
}) => {
  const { client, isLoadingClient } = useSmartAccountClient({
    type: "ModularAccountV2",
    accountParams: {
      mode: props.mode,
    },
  });
  const { chain, setChain, isSettingChain } = useChain();

  useEffect(() => {
    console.log({ have: chain.name, want: props.chain.name });
    if (isSettingChain || chain.name === props.chain.name) return;
    console.log("setting");
    setChain({ chain: props.chain });
  }, [chain.name, isSettingChain, props.chain, props.chain.id, setChain]);

  const [status, setStatus] = useState<MintStatus>(initialValuePropState);
  const [mintStarted, setMintStarted] = useState(false);
  const isLoading =
    Object.values(status).some((x) => x === "loading") ||
    isLoadingClient ||
    isSettingChain ||
    chain.name !== props.chain.name;
  const { setToast } = useToast();

  console.log({
    mode: props.mode,
    chain: chain.name,
    isLoadingClient,
    address: client?.getAddress(),
  });

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

  const { sendUserOperationResult, sendUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    onError: handleError,
    onSuccess: (resp) => handleSuccess(resp.hash),
    onMutate: () => {
      setMintStarted(true);
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, signing: "success" }));
      }, 500);
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, gas: "success" }));
      }, 750);
    },
  });

  const { data: uri } = useQuery({
    queryKey: ["contractURI", props.contractAddress],
    queryFn: async () => {
      if (!client) {
        throw new Error("no client");
      }
      return client.readContract({
        address: props.contractAddress,
        abi: AccountKitNftMinterABI,
        functionName: "baseURI",
      });
    },
    enabled: !!client && !!client?.readContract && props.chain.id === chain.id,
  });

  const handleCollectNFT = useCallback(async () => {
    if (!client) {
      console.error("no client");
      return;
    }

    setStatus({
      signing: "loading",
      gas: "loading",
      batch: "loading",
    });

    sendUserOperation({
      uo: {
        target: props.contractAddress,
        data: encodeFunctionData({
          abi: AccountKitNftMinterABI,
          functionName: "mintTo",
          args: [client.getAddress()],
        }),
      },
    });
  }, [client, props.contractAddress, sendUserOperation]);

  const transactionUrl = useMemo(() => {
    if (!client?.chain?.blockExplorers || !sendUserOperationResult?.hash) {
      return undefined;
    }
    return `${client.chain.blockExplorers.default.url}/tx/${sendUserOperationResult.hash}`;
  }, [client, sendUserOperationResult?.hash]);

  return {
    isLoading,
    status,
    mintStarted,
    handleCollectNFT,
    uri,
    transactionUrl,
  };
};
