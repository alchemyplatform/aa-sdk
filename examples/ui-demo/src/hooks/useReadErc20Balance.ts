import { AlchemyTransport } from "@account-kit/infra";
import { useQuery, type QueryObserverResult } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  createPublicClient,
  erc20Abi,
  formatUnits,
  type Hex,
  type Chain,
  type PublicClient,
} from "viem";

export interface UseReadErc20BalanceParams {
  accountAddress?: Hex;
  tokenAddress?: Hex;
  clientOptions: {
    chain: Chain;
    transport: AlchemyTransport;
  };
}

export interface UseReadErc20BalanceReturn {
  balance?: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<QueryObserverResult<string | undefined, Error>>;
}

export const useReadErc20Balance = (
  params: UseReadErc20BalanceParams,
): UseReadErc20BalanceReturn => {
  const { accountAddress, tokenAddress, clientOptions } = params;
  const { chain, transport } = clientOptions;

  const publicClient = useMemo<PublicClient | undefined>(() => {
    if (!chain) {
      return undefined;
    }
    return createPublicClient({
      chain,
      transport,
    });
  }, [chain, transport]);

  const queryKey = useMemo(
    () => ["erc20Balance", tokenAddress, accountAddress, chain?.id],
    [tokenAddress, accountAddress, chain],
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
