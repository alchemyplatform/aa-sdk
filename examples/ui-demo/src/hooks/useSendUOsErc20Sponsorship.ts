import { useMutation } from "@tanstack/react-query";
import { type Chain, type Hex, type Address } from "viem";
import { useToast } from "@/hooks/useToast";
import { type AlchemyTransport } from "@account-kit/infra";
import { useModularAccountV2Client } from "./useModularAccountV2Client";
import { DEMO_USDC_ADDRESS_6_DECIMALS } from "../utils/constants";
import { AccountMode } from "@/app/config";

const ERC20_SPONSORSHIP_POLICY_ID =
  process.env.NEXT_PUBLIC_ERC20_SPONSORSHIP_POLICY_ID;

export type UserOperationCall = {
  target: Address;
  data: Hex;
  value?: bigint;
};

export interface UseSendUOsErc20SponsorshipParams {
  toastText: string;
  clientOptions: {
    mode: AccountMode;
    chain: Chain;
    transport: AlchemyTransport;
  };
}

export interface UseSendUOsErc20SponsorshipReturn {
  isLoadingClient: boolean;
  isSending: boolean;
  txHash?: Hex;
  error?: Error | null;
  sendUOs: (userOperations: UserOperationCall[]) => void;
  sendUOsAsync: (
    userOperations: UserOperationCall[],
  ) => Promise<Hex | undefined>;
  reset: () => void;
}

export const useSendUOsErc20Sponsorship = (
  params: UseSendUOsErc20SponsorshipParams,
): UseSendUOsErc20SponsorshipReturn => {
  const { clientOptions } = params;
  const { setToast } = useToast();

  const { client, isLoadingClient } = useModularAccountV2Client({
    ...clientOptions,
    policyId: ERC20_SPONSORSHIP_POLICY_ID,
    policyToken: {
      address: DEMO_USDC_ADDRESS_6_DECIMALS,
      maxTokenAmount: BigInt(100_000_000_000_000),
    },
  });

  const {
    mutate: sendUOs,
    mutateAsync: sendUOsAsync,
    data: txHash,
    isPending: isSending,
    error,
    reset,
  } = useMutation<Hex | undefined, Error, UserOperationCall[]>({
    mutationFn: async (userOperations: UserOperationCall[]) => {
      if (!client) {
        throw new Error("Smart account client not ready");
      }
      if (!client.account) {
        throw new Error("Smart account not connected or address not available");
      }

      const userOpHash = await client.sendUserOperation({
        uo: userOperations,
      });

      return client.waitForUserOperationTransaction(userOpHash);
    },
    onError: (err: Error) => {
      console.error("UOs Sending Error:", err);
      setToast({
        type: "error",
        open: true,
        text: err.message ?? "UOs Sending failed",
      });
    },
    onSuccess: (hash: Hex | undefined) => {
      console.log("UOs Sending Transaction Hash:", hash);
      setToast({
        type: "success",
        open: true,
        text: params.toastText,
      });
    },
  });

  return {
    isLoadingClient,
    isSending,
    txHash,
    error,
    sendUOs,
    sendUOsAsync,
    reset,
  };
};
