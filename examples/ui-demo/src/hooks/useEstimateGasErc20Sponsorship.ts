import { useMutation } from "@tanstack/react-query";
import { type Hex, type Address, toHex } from "viem";
import {
  DEMO_USDC_ADDRESS_6_DECIMALS,
  DEMO_USDC_APPROVAL_AMOUNT,
  DEMO_USDC_APPROVE_BELOW_AMOUNT,
} from "../utils/constants";
import { AccountMode } from "@/app/config";
import { usePrepareCalls } from "@account-kit/react";
import { useSmartAccountClient } from "@account-kit/react";

const ERC20_SPONSORSHIP_POLICY_ID =
  process.env.NEXT_PUBLIC_ERC20_SPONSORSHIP_POLICY_ID!;

export type UserOperationCall = {
  target: Address;
  data: Hex;
  value?: bigint;
};

export interface UseEstimateGasErc20SponsorshipParams {
  accountMode: AccountMode;
}

type EstimateGasErc20SponsorshipResult = {
  feeUsd: number;
};

export interface UseEstimateGasErc20SponsorshipReturn {
  isLoadingClient: boolean;
  isEstimating: boolean;
  estimateGas: (userOperations: UserOperationCall[]) => void;
  estimateGasAsync: (
    userOperations: UserOperationCall[],
  ) => Promise<EstimateGasErc20SponsorshipResult | undefined>;
  estimateResult: EstimateGasErc20SponsorshipResult | undefined;
  error: Error | null;
  reset: () => void;
}

export const useEstimateGasErc20Sponsorship = (
  params: UseEstimateGasErc20SponsorshipParams,
): UseEstimateGasErc20SponsorshipReturn => {
  const { client, isLoadingClient } = useSmartAccountClient({
    type: "ModularAccountV2",
    accountParams: {
      mode: params.accountMode,
    },
  });

  const { prepareCallsAsync } = usePrepareCalls({
    client,
  });

  const {
    mutate,
    mutateAsync,
    data: estimateResult,
    isPending: isEstimating,
    error,
    reset,
  } = useMutation<
    EstimateGasErc20SponsorshipResult | undefined,
    Error,
    UserOperationCall[]
  >({
    mutationFn: async (userOperations: UserOperationCall[]) => {
      if (!client) {
        throw new Error("Smart wallet client not ready");
      }

      const result = await prepareCallsAsync({
        calls: userOperations.map((x) => ({
          to: x.target,
          data: x.data,
          value: x.value ? toHex(x.value) : undefined,
        })),
        capabilities: {
          paymasterService: {
            policyId: ERC20_SPONSORSHIP_POLICY_ID,
            onlyEstimation: true,
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

      let feePayment;
      if (result.type === "user-operation-v060") {
        feePayment = result.feePayment;
      } else if (result.type === "user-operation-v070") {
        feePayment = result.feePayment;
      } else {
        throw new Error(
          `Unknown user operation type ${result.type} for fee estimation`,
        );
      }

      return {
        feeUsd: Number(feePayment.maxAmount) / 10 ** 6,
      };
    },
  });

  return {
    isLoadingClient,
    isEstimating,
    error,
    estimateGas: mutate,
    estimateGasAsync: mutateAsync,
    reset,
    estimateResult,
  };
};
