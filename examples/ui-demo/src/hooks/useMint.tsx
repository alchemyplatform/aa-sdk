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
import { AccountMode } from "@/app/config";

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
  mode: AccountMode;
  chain: Chain;
}): UseMintReturn => {
  const { chain: activeChain, isSettingChain } = useChain();

  const { client, isLoadingClient } = useSmartAccountClient({
    type: "ModularAccountV2",
    accountParams: { mode: props.mode },
  });
  const { isDeployed, refetch: refetchDeploymentStatus } =
    useDeploymentStatus();

  const [status, setStatus] = useState<MintStatus>(initialValuePropState);
  const [mintStarted, setMintStarted] = useState(false);
  const [minedTxHash, setMinedTxHash] = useState<string | undefined>(undefined);
  const isLoading =
    Object.values(status).some((x) => x === "loading") ||
    isLoadingClient ||
    isSettingChain ||
    activeChain.id !== props.chain.id;
  const { setToast } = useToast();

  const handleSuccess = useCallback(() => {
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
  }, [isDeployed, refetchDeploymentStatus, setToast]);

  const handleError = useCallback(
    (error: Error) => {
      console.error(error);
      setStatus(initialValuePropState);
      setMintStarted(false);
      setToast({
        type: "error",
        text: "There was a problem with that action",
        open: true,
      });
    },
    [setToast],
  );

  const { sendUserOperationAsync } = useSendUserOperation({
    client,
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
    enabled: !!client && !!client?.readContract,
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

    try {
      const result = await sendUserOperationAsync({
        uo: {
          target: props.contractAddress,
          data: encodeFunctionData({
            abi: AccountKitNftMinterABI,
            functionName: "mintTo",
            args: [client.getAddress()],
          }),
        },
        overrides: {
          maxPriorityFeePerGas: BigInt(0),
          maxFeePerGas: BigInt(1),
        },
      });

      const MAX_REPLACEMENTS = 3;

      const waitUntilMinedWithRetries = async (params: {
        hash: `0x${string}`;
        request?: any;
        maxReplacements: number;
      }): Promise<`0x${string}`> => {
        try {
          return await client.waitForUserOperationTransaction({
            hash: params.hash,
            retries: { maxRetries: 3, intervalMs: 5_000, multiplier: 1 },
          });
        } catch (e) {
          console.warn(
            "waitForUserOperationTransaction failed; attempting drop-and-replace",
            { error: e, remainingReplacements: params.maxReplacements },
          );
          if (params.maxReplacements <= 0 || !params.request) throw e;
          const { hash: newHash } = await client.dropAndReplaceUserOperation({
            uoToDrop: params.request,
          });
          console.log("Replaced user operation hash:", newHash);
          return waitUntilMinedWithRetries({
            hash: newHash as `0x${string}`,
            request: params.request,
            maxReplacements: params.maxReplacements - 1,
          });
        }
      };

      const minedHash = await waitUntilMinedWithRetries({
        hash: result.hash as `0x${string}`,
        request: (result as any).request,
        maxReplacements: MAX_REPLACEMENTS,
      });

      setMinedTxHash(minedHash);
      handleSuccess();
    } catch (error) {
      handleError(error as Error);
    }
  }, [
    client,
    props.contractAddress,
    sendUserOperationAsync,
    handleError,
    handleSuccess,
  ]);

  const transactionUrl = useMemo(() => {
    if (!client?.chain?.blockExplorers || !minedTxHash) {
      return undefined;
    }
    return `${client.chain.blockExplorers.default.url}/tx/${minedTxHash}`;
  }, [client, minedTxHash]);

  return {
    isLoading,
    status,
    mintStarted,
    handleCollectNFT,
    uri,
    transactionUrl,
  };
};
