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

// This is the Staging Sepolia PostOp mode policy ID from the documentation
const ERC20_SPONSORSHIP_POLICY_ID = "c9fadff3-a3aa-496b-8705-6d52c44e9ecb";
// Alchemy Paymaster address for Sepolia v0.7, from the documentation
const ALCHEMY_PAYMASTER_ADDRESS: Address =
  "0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633";

// ABI for ERC20 approve function
const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
]);

// Assumed ABI for the NFT mint function.
// IMPORTANT: Adjust this if your NFT contract's mint function is different
// (e.g., different name, different parameters).
const nftAbi = parseAbi(["function mintTo(address to)"]);

// Amount of USDC to approve for gas payment (e.g., 100 USDC, assuming 6 decimals)
// Adjust if DEMO_USDC_ADDRESS has different decimals or if more/less approval is needed.
const USDC_GAS_APPROVAL_AMOUNT = BigInt(1000000000000000000); // 1 USDC for gas, adjust as needed
const NFT_MINT_PRICE = BigInt(1000000000000000000); // 1 USDC for mint price (1 * 10^18)

export interface UseMintNftWithErc20SponsorshipParams {
  clientOptions: {
    mode: "default" | "7702"; // Assuming this mode is still relevant
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
      maxTokenAmount: USDC_GAS_APPROVAL_AMOUNT, // Max amount for gas sponsorship
    },
  });

  const {
    mutate: mintNft,
    mutateAsync: mintNftAsync,
    data: txHash,
    isPending: isMinting,
    error,
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
        args: [accountAddress], // Minting to the smart account itself
      });

      const userOpHash = await client.sendUserOperation({
        uo: [
          {
            target: DEMO_USDC_ADDRESS,
            data: approveGasSponsorshipCallData,
            // value: BigInt(0), // fixed BigInt literal
          },
          {
            target: DEMO_USDC_ADDRESS, // Still USDC contract
            data: approveNftMintCallData, // Data for approving NFT contract
            // value: BigInt(0),
          },
          {
            target: DEMO_ERC20NFT_ADDRESS,
            data: mintCallData,
            // value: BigInt(0), // fixed BigInt literal // Assuming NFT minting itself doesn\'t require ETH value
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
      setToast({
        type: "success",
        open: true,
        text: "Successfully submitted NFT mint transaction!",
      });
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
  };
};
