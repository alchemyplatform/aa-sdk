import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useToast } from "./useToast";
import {
  useSmartAccountClient,
  useSendUserOperation,
  useChain,
} from "@account-kit/react";
import { Address, Chain, encodeFunctionData } from "viem";
import { AccountKitNftMinterABI } from "@/utils/config";
import { MintStatus } from "@/components/small-cards/MintCard";
import { useDeploymentStatus } from "@/hooks/useDeploymentStatus";

const initialValuePropState = {
  signing: "initial",
  gas: "initial",
  batch: "initial",
} satisfies MintStatus;

export interface UseMintReturn {
  isLoading: boolean;
  status: MintStatus;
  mintStarted: boolean;
  handleCollectNFT: () => unknown;
  uri?: string;
  transactionUrl?: string;
}

export const useMint = (props: {
  contractAddress: Address;
  mode: "default" | "7702";
  chain: Chain;
}): UseMintReturn => {
  const { chain: activeChain, isSettingChain } = useChain();

  const { client, isLoadingClient } = useSmartAccountClient({
    type: "ModularAccountV2",
    accountParams: {
      mode: props.mode,
    },
  });
  const { isDeployed, refetch: refetchDeploymentStatus } =
    useDeploymentStatus();

  const [status, setStatus] = useState<MintStatus>(initialValuePropState);
  const [mintStarted, setMintStarted] = useState(false);
  const isLoading =
    Object.values(status).some((x) => x === "loading") ||
    isLoadingClient ||
    isSettingChain ||
    activeChain.id !== props.chain.id;
  const { setToast } = useToast();

  const handleSuccess = () => {
    setStatus(() => ({
      batch: "success",
      gas: "success",
      signing: "success",
    }));

    if (!isDeployed) {
      refetchDeploymentStatus();
    }

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
    onSuccess: handleSuccess,
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

  // Note: Temporarily hardcoding the URI to update the image for the demo.
  // We will need to deploy a new NFT contract with a new URI to update the image officially.
  // const { data: uri } = useQuery({
  //   queryKey: ["contractURI", props.contractAddress],
  //   queryFn: async () => {
  //     if (!client) {
  //       throw new Error("no client");
  //     }
  //     return client.readContract({
  //       address: props.contractAddress,
  //       abi: AccountKitNftMinterABI,
  //       functionName: "baseURI",
  //     });
  //   },
  //   enabled: !!client && !!client?.readContract,
  // });

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
    uri: "/images/nft-image.png",
    transactionUrl,
  };
};
