import { AccountMode } from "@/app/config";
import { useQuery, type QueryObserverResult } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  createPublicClient,
  erc20Abi,
  http,
  formatUnits,
  type Hex,
  type Chain,
  type PublicClient,
} from "viem";

export interface UseReadErc20BalanceParams {
  accountAddress?: Hex;
  tokenAddress?: Hex;
  chain?: Chain;
  rpcUrl?: string;
  accountMode?: AccountMode;
}

export interface UseReadErc20BalanceReturn {
  balance?: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<QueryObserverResult<string | undefined, Error>>;
}

export const useReadErc20Balance = (
  params: UseReadErc20BalanceParams
): UseReadErc20BalanceReturn => {
  const { accountAddress, tokenAddress, chain, rpcUrl } = params;

  const publicClient = useMemo<PublicClient | undefined>(() => {
    if (!chain) {
      return undefined;
    }
    return createPublicClient({
      chain,
      transport: http(rpcUrl),
    });
  }, [chain, rpcUrl]);

  const queryKey = useMemo(
    () => ["erc20Balance", tokenAddress, accountAddress, chain?.id, rpcUrl],
    [tokenAddress, accountAddress, chain, rpcUrl, params.accountMode]
  );

  const {
    data: balance,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!publicClient || !tokenAddress || !accountAddress) {
        return undefined;
      }

      try {
        const [balanceResult, decimalsResult] = await Promise.all([
          publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [accountAddress],
          }),
          publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "decimals",
          }),
        ]);
        return formatUnits(balanceResult, Number(decimalsResult));
      } catch (e) {
        console.error("Error fetching ERC20 balance:", e);
        if (e instanceof Error) {
          throw e;
        }
        throw new Error("An unknown error occurred while fetching balance.");
      }
    },
    enabled: !!publicClient && !!tokenAddress && !!accountAddress && !!chain,
    staleTime: 15_000,
  });

  return {
    balance,
    isLoading,
    isError,
    error,
    refetch,
  };
};
