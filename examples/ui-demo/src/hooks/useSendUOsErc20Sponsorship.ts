import { useMutation } from "@tanstack/react-query";
import { type Chain, type Hex, type Address, toHex, slice } from "viem";
import { useToast } from "@/hooks/useToast";
import { type AlchemyTransport } from "@account-kit/infra";
import { useModularAccountV2Client } from "./useModularAccountV2Client";
import {
  DEMO_USDC_ADDRESS_6_DECIMALS,
  DEMO_USDC_APPROVAL_AMOUNT,
  DEMO_USDC_APPROVE_BELOW_AMOUNT,
} from "../utils/constants";
import { AccountMode } from "@/app/config";
import {
  useSmartWalletClient,
  useSendCalls,
} from "@account-kit/react/experimental";

const ERC20_SPONSORSHIP_POLICY_ID =
  process.env.NEXT_PUBLIC_ERC20_SPONSORSHIP_POLICY_ID!;

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
  });

  const smartWalletClient = useSmartWalletClient({
    account: client?.account?.address,
  });

  const { sendCallsAsync } = useSendCalls({
    client: smartWalletClient,
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
      if (!smartWalletClient) {
        throw new Error("Smart wallet client not ready");
      }

      const { ids } = await sendCallsAsync({
        calls: userOperations.map((x) => ({
          to: x.target,
          data: x.data,
          value: x.value ? toHex(x.value) : undefined,
        })),
        capabilities: {
          paymasterService: {
            policyId: ERC20_SPONSORSHIP_POLICY_ID,
            erc20: {
              tokenAddress: DEMO_USDC_ADDRESS_6_DECIMALS,
              postOpSettings: {
                autoApprove: {
                  below: toHex(DEMO_USDC_APPROVE_BELOW_AMOUNT),
                  amount: toHex(DEMO_USDC_APPROVAL_AMOUNT),
                },
              },
            },
          },
        },
      });

      const { status } = await smartWalletClient.waitForCallsStatus({
        id: ids[0],
      });
      if (status === "success") {
        return slice(ids[0], 32);
      }
      throw new Error(
        `User operation with id ${ids[0]} failed to execute after 60 seconds`,
      );
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
