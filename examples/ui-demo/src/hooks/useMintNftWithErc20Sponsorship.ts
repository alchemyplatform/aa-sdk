import { useMutation } from "@tanstack/react-query";
import {
  encodeFunctionData,
  parseAbi,
  type Chain,
  type Hex,
  type Address,
} from "viem";
import { DEMO_USDC_ADDRESS, DEMO_ERC20NFT_ADDRESS } from "./7702/dca/constants";
import { useToast } from "@/hooks/useToast";
import { type AlchemyTransport } from "@account-kit/infra";
import { useModularAccountV2Client } from "./useModularAccountV2Client";

const ERC20_SPONSORSHIP_POLICY_ID =
  process.env.NEXT_PUBLIC_ERC20_SPONSORSHIP_POLICY_ID;
// Alchemy Paymaster address for entrypoint v0.7
const ALCHEMY_PAYMASTER_ADDRESS: Address =
  "0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633";

// ABI
const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
]);
const nftAbi = parseAbi(["function mintTo(address to)"]);

// Amount of USDC to approve for gas payment (e.g., 100 USDC, assuming 18 decimals)
const USDC_GAS_APPROVAL_AMOUNT = BigInt(100_000_000_000_000_000_000); // 100 USDC for gas, adjust as needed
const NFT_MINT_PRICE = BigInt(1_000_000_000_000_000_000); // 1 USDC for mint price (1 * 10^18)

export interface UseMintNftWithErc20SponsorshipParams {
  clientOptions: {
    mode: "default" | "7702";
    chain: Chain;
    transport: AlchemyTransport;
  };
}

export interface UseMintNftWithErc20SponsorshipReturn {
  isLoadingClient: boolean;
  isMinting: boolean;
  txHash?: Hex;
  error?: Error | null;
  mintNft: () => void;
  mintNftAsync: () => Promise<Hex | undefined>;
  reset: () => void;
}

export const useMintNftWithErc20Sponsorship = (
  params: UseMintNftWithErc20SponsorshipParams
): UseMintNftWithErc20SponsorshipReturn => {
  const { clientOptions } = params;
  const { setToast } = useToast();

  const { client, isLoadingClient } = useModularAccountV2Client({
    ...clientOptions,
    policyId: ERC20_SPONSORSHIP_POLICY_ID,
    policyToken: {
      address: DEMO_USDC_ADDRESS,
      maxTokenAmount: USDC_GAS_APPROVAL_AMOUNT,
    },
  });

  const {
    mutate: mintNft,
    mutateAsync: mintNftAsync,
    data: txHash,
    isPending: isMinting,
    error,
    reset,
  } = useMutation<Hex | undefined, Error, void>({
    mutationFn: async () => {
      if (!client) {
        throw new Error("Smart account client not ready");
      }
      if (!client.account) {
        throw new Error("Smart account not connected or address not available");
      }
      const accountAddress = client.account.address;

      // 1. Approve the Alchemy Paymaster to spend USDC for gas
      const approveGasSponsorshipCallData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [ALCHEMY_PAYMASTER_ADDRESS, USDC_GAS_APPROVAL_AMOUNT],
      });

      // 2. Approve the NFT contract to spend USDC for the mint price
      const approveNftMintCallData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [DEMO_ERC20NFT_ADDRESS, NFT_MINT_PRICE],
      });

      // 3. Mint the NFT to the smart account's address
      const mintCallData = encodeFunctionData({
        abi: nftAbi,
        functionName: "mintTo",
        args: [accountAddress],
      });

      const userOpHash = await client.sendUserOperation({
        uo: [
          {
            target: DEMO_USDC_ADDRESS,
            data: approveGasSponsorshipCallData,
          },
          {
            target: DEMO_USDC_ADDRESS,
            data: approveNftMintCallData,
          },
          {
            target: DEMO_ERC20NFT_ADDRESS,
            data: mintCallData,
          },
        ],
      });

      const txnHash = await client.waitForUserOperationTransaction(userOpHash);
      return txnHash;
    },
    onError: (err: Error) => {
      console.error("NFT Minting Error:", err);
      setToast({
        type: "error",
        open: true,
        text: err.message ?? "NFT Mint failed",
      });
    },
    onSuccess: (hash: Hex | undefined) => {
      console.log("NFT Mint Transaction Hash:", hash);
    },
  });

  return {
    isLoadingClient,
    isMinting,
    txHash,
    error,
    mintNft,
    mintNftAsync,
    reset,
  };
};
