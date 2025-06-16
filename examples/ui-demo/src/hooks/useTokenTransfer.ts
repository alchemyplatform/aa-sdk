import { useMutation } from "@tanstack/react-query";
import { encodeFunctionData, parseUnits, type Chain, type Hex } from "viem";
import { erc20MintableAbi } from "./7702/dca/abi/erc20Mintable";
import { useToast } from "@/hooks/useToast";
import { AlchemyTransport } from "@account-kit/infra";
import { createSmartWalletClient } from "@account-kit/wallet-client";
import { DEMO_USDC_ADDRESS_6_DECIMALS } from "../utils/constants";
import type { AlchemySigner } from "@account-kit/core";

export interface UseTokenTransferParams {
  amount: number | string;
  recipient: `0x${string}`;
  signer: AlchemySigner;
  clientOptions: {
    mode: "default" | "7702";
    chain: Chain;
    transport: AlchemyTransport;
  };
}

export interface UseTokenTransferReturn {
  isLoadingClient: boolean;
  isTransferring: boolean;
  txHash?: Hex;
  error?: Error | null;
  transfer: () => void;
  transferAsync: () => Promise<Hex | undefined>;
  reset: () => void;
}

export const useTokenTransfer = (
  params: UseTokenTransferParams,
): UseTokenTransferReturn => {
  const { amount, recipient, signer, clientOptions } = params;
  const { setToast } = useToast();

  const {
    mutate: transfer,
    mutateAsync: transferAsync,
    data: txHash,
    isPending: isTransferring,
    error,
    reset,
  } = useMutation<Hex | undefined, Error, void>({
    mutationFn: async () => {
      if (!signer) {
        throw new Error("Signer is required");
      }

      // Create the smart wallet client
      const client = createSmartWalletClient({
        transport: clientOptions.transport,
        chain: clientOptions.chain,
        mode: "remote",
        signer,
      });

      const amountInTokenUnits = parseUnits(String(amount), 6);

      // Prepare the calls
      const preparedCalls = await client.prepareCalls({
        /*calls: [
          {
            to: DEMO_USDC_ADDRESS_6_DECIMALS,
            data: encodeFunctionData({
              abi: erc20MintableAbi,
              functionName: "transfer",
              args: [recipient, amountInTokenUnits],
            }),
          },
        ],*/
        calls: [
          // Calls here can include `to`, `data`, and `value` params.
          { to: "0x0000000000000000000000000000000000000000", data: "0x" },
        ],
        from: await signer.getAddress(),
        capabilities: {
          eip7702Auth: clientOptions.mode === "7702" ? true : undefined,
          paymasterService: {
            policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID!,
          },
        },
      });

      console.log("****preparedCalls:", preparedCalls);
      // Sign the calls
      const signedCalls = await client.signPreparedCalls(preparedCalls);
      console.log("****signedCalls:", signedCalls);
      // Send the userOp
      const { preparedCallIds } = await client.sendPreparedCalls(signedCalls);
      console.log("****preparedCallIds:", preparedCallIds);

      // Wait for the transaction to be mined
      let status = await client.getCallsStatus(preparedCallIds[0]);
      while (status?.status !== 200) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        status = await client.getCallsStatus(preparedCallIds[0]);
      }

      console.log("****status:", status);
      return status?.receipts?.[0]?.transactionHash as Hex;
    },
    onError: (err) => {
      console.error(err);
      setToast({
        type: "error",
        open: true,
        text: err.message ?? "Transfer failed",
      });
    },
    onSuccess: () => {
      setToast({
        type: "success",
        open: true,
        text: "Successfully transferred USDC!",
      });
    },
  });

  return {
    isLoadingClient: false, // Since we create the client in the mutation
    isTransferring,
    txHash,
    error,
    transfer,
    transferAsync,
    reset,
  };
};
