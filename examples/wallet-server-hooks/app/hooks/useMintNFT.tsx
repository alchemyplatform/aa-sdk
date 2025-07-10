import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useSmartAccountClient,
} from "@account-kit/react";
import { encodeFunctionData, zeroAddress } from "viem";
import { NFT_MINTABLE_ABI_PARSED, NFT_CONTRACT_ADDRESS } from "@/lib/constants";
import {
  useCallsStatus,
  useSendCalls,
  useSmartWalletClient,
} from "@account-kit/react/experimental";

export interface UseMintNFTParams {
  onSuccess?: () => void;
}
export interface UseMintReturn {
  isMinting: boolean;
  handleMint: () => void;
  transactionUrl?: string;
  error?: string;
}

// TODO(jh): test these hooks
// - [x] useSmartWalletClient - tested here
// - [x] useSendCalls - tested here
// - [x] useSendUserOperation - tested in main ui demo app
// - [] useWaitForUserOperationTransaction - need to test (w/ UO hash, not call id)
// - [] useGrantPermissions - need to test
// - [] usePrepareCalls
// - [] useSendPreparedCalls
// - [] useSignMessage - prob ok
// - [] useSignTypedData - prob ok

export const useMint = ({ onSuccess }: UseMintNFTParams): UseMintReturn => {
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string>();

  const { client } = useSmartAccountClient({});
  const walletClient = useSmartWalletClient({
    account: client?.account.address,
  });
  const { sendCallsAsync, sendCallsResult } = useSendCalls({
    client: walletClient,
  });
  const { data: callStatus, refetch } = useCallsStatus({
    client: walletClient,
    callId: sendCallsResult?.ids[0],
    queryOptions: {
      // Refetch every 2 sec while pending.
      refetchInterval: (q) => q.state.data?.status === 100 ? 2000 : false
    }
  });
  
  const handleSuccess = useCallback(() => {
    setIsMinting(false);
    setError(undefined);
    onSuccess?.();
  }, [onSuccess]);

  const handleError = (error: unknown) => {
    console.error("Mint error:", error);
    setIsMinting(false);
    setError(error instanceof Error ? error.message : "Failed to mint NFT");
  };

  const handleMint = useCallback(async () => {
    if (!walletClient?.account) {
      setError("Wallet client not ready");
      return;
    }

    setIsMinting(true);
    setError(undefined);

    try {
      await sendCallsAsync({
        calls: [
          {
            to: NFT_CONTRACT_ADDRESS,
            data: encodeFunctionData({
              abi: NFT_MINTABLE_ABI_PARSED,
              functionName: "mintTo",
              args: [walletClient.account.address],
            }),
          },
        ],
      });
    } catch (err) {
      handleError(err);
    }
  }, [walletClient?.account, sendCallsAsync]);

  useEffect(() => {
    if (callStatus?.status === 200) {
      handleSuccess();
    }
  }, [callStatus, handleSuccess, refetch]);

  const transactionUrl = useMemo(() => {
    const txHash = callStatus?.receipts?.[0]?.transactionHash;
    if (!client?.chain?.blockExplorers || !txHash) {
      return undefined;
    }
    return `${client.chain.blockExplorers.default.url}/tx/${txHash}`;
  }, [client, callStatus]);

  return {
    isMinting,
    handleMint,
    transactionUrl,
    error,
  };
};
