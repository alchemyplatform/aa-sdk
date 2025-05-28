import { useMutation } from "@tanstack/react-query";
import { type Chain, type Hex, type Address, formatEther } from "viem";
import { type AlchemyTransport } from "@account-kit/infra";
import { useModularAccountV2Client } from "./useModularAccountV2Client";
import { USDC_GAS_APPROVAL_AMOUNT } from "@/components/modals/Erc20/utils";
import { DEMO_USDC_ADDRESS_6_DECIMALS } from "../utils/constants";

const ERC20_SPONSORSHIP_POLICY_ID =
  process.env.NEXT_PUBLIC_ERC20_SPONSORSHIP_POLICY_ID;

export type UserOperationCall = {
  target: Address;
  data: Hex;
  value?: bigint;
};

export interface UseEstimateGasErc20SponsorshipParams {
  clientOptions: {
    mode: "default" | "7702";
    chain: Chain;
    transport: AlchemyTransport;
  };
}

type EstimateGasErc20SponsorshipResult = {
  totalGas: bigint;
  gasPrice: bigint;
  feeWei: bigint;
  feeEth: string;
};

export interface UseEstimateGasErc20SponsorshipReturn {
  isLoadingClient: boolean;
  isEstimating: boolean;
  estimateGas: (userOperations: UserOperationCall[]) => void;
  estimateGasAsync: (
    userOperations: UserOperationCall[]
  ) => Promise<EstimateGasErc20SponsorshipResult | undefined>;
  estimateResult: EstimateGasErc20SponsorshipResult | undefined;
  error: Error | null;
  reset: () => void;
}

export const useEstimateGasErc20Sponsorship = (
  params: UseEstimateGasErc20SponsorshipParams
): UseEstimateGasErc20SponsorshipReturn => {
  const { clientOptions } = params;

  const { client, isLoadingClient } = useModularAccountV2Client({
    ...clientOptions,
    policyId: ERC20_SPONSORSHIP_POLICY_ID,
    policyToken: {
      address: DEMO_USDC_ADDRESS_6_DECIMALS,
      maxTokenAmount: USDC_GAS_APPROVAL_AMOUNT,
    },
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
        throw new Error("Smart account client not ready");
      }
      if (!client.account) {
        throw new Error("Smart account not connected or address not available");
      }

      return estimateFee(userOperations);
    },
  });

  const estimateFee = async (userOperations: UserOperationCall[]) => {
    if (!client) throw new Error("Smart account client not ready");
    if (!client.account)
      throw new Error("Smart account not connected or address not available");
    const [uoStruct, latestBlock, { maxFeePerGas, maxPriorityFeePerGas }] =
      await Promise.all([
        client.buildUserOperation({ uo: userOperations }),
        client.getBlock(),
        client.estimateFeesPerGas(),
      ]);

    const toBig = (v?: Hex | number | bigint): bigint =>
      v == null
        ? BigInt(0)
        : typeof v === "bigint"
        ? v
        : typeof v === "number"
        ? BigInt(v)
        : BigInt(v);

    const gasBuckets = [
      "preVerificationGas",
      "verificationGasLimit",
      "callGasLimit",
      ...("paymasterPostOpGasLimit" in uoStruct
        ? ["paymasterPostOpGasLimit"]
        : []),
    ] as const;

    const totalGas = gasBuckets.reduce<bigint>(
      (sum, field) => sum + toBig((uoStruct as any)[field]),
      BigInt(0)
    );

    const baseFee = latestBlock.baseFeePerGas;

    let gasPrice: bigint;
    if (baseFee == null) {
      gasPrice = maxFeePerGas;
    } else {
      const effectiveGasPrice = baseFee + maxPriorityFeePerGas;
      gasPrice =
        effectiveGasPrice < maxFeePerGas ? effectiveGasPrice : maxFeePerGas;
    }

    const feeWei = totalGas * gasPrice;
    const feeEth = formatEther(feeWei);

    return {
      totalGas,
      gasPrice,
      feeWei,
      feeEth,
    } as const;
  };

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
