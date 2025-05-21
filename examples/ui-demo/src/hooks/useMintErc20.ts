import { useMutation } from "@tanstack/react-query";
import { encodeFunctionData, parseUnits, type Chain, type Hex } from "viem";
import { erc20MintableAbi } from "./7702/dca/abi/erc20Mintable";
import { DEMO_USDC_ADDRESS_6_DECIMALS } from "./7702/dca/constants";
import { useToast } from "@/hooks/useToast";
import { AlchemyTransport } from "@account-kit/infra";
import { useModularAccountV2Client } from "./useModularAccountV2Client";

export interface UseMintErc20Params {
  amount: number | string;
  clientOptions: {
    mode: "default" | "7702";
    chain: Chain;
    transport: AlchemyTransport;
  };
}

export interface UseMintErc20Return {
  isLoadingClient: boolean;
  isMinting: boolean;
  txHash?: Hex;
  error?: Error | null;
  mint: () => void;
  mintAsync: () => Promise<Hex | undefined>;
  reset: () => void;
}

export const useMintErc20 = (
  params: UseMintErc20Params
): UseMintErc20Return => {
  const { amount, clientOptions } = params;
  const { setToast } = useToast();

  const { client, isLoadingClient } = useModularAccountV2Client({
    ...clientOptions,
  });

  const {
    mutate: mint,
    mutateAsync: mintAsync,
    data: txHash,
    isPending: isMinting,
    error,
    reset,
  } = useMutation<Hex | undefined, Error, void>({
    mutationFn: async () => {
      if (!client) {
        throw new Error("Smart account client not ready");
      }

      const amountInTokenUnits = parseUnits(String(amount), 6);

      const userOpHash = await client.sendUserOperation({
        uo: {
          target: DEMO_USDC_ADDRESS_6_DECIMALS,
          data: encodeFunctionData({
            abi: erc20MintableAbi,
            functionName: "mint",
            args: [client.account.address, amountInTokenUnits],
          }),
        },
      });

      return client.waitForUserOperationTransaction(userOpHash);
    },
    onError: (err: Error) => {
      console.error(err);
      setToast({
        type: "error",
        open: true,
        text: err.message ?? "Mint failed",
      });
    },
    onSuccess: () => {
      setToast({
        type: "success",
        open: true,
        text: "Successfully minted USDC!",
      });
    },
  });

  return {
    isLoadingClient,
    isMinting,
    txHash,
    error,
    mint,
    mintAsync,
    reset,
  };
};
