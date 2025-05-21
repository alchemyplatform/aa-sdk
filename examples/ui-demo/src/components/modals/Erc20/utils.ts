import {
  DEMO_NFT_USDC_MINTABLE_ADDRESS,
  DEMO_USDC_ADDRESS_6_DECIMALS,
} from "@/lib/constants";
import { Address, encodeFunctionData, parseAbi } from "viem";

// Alchemy Paymaster address for entrypoint v0.7
const ALCHEMY_PAYMASTER_ADDRESS: Address =
  "0x2cc0c7981D846b9F2a16276556f6e8cb52BfB633";
const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
]);
const nftAbi = parseAbi(["function mintTo(address to)"]);

// Amount of USDC to approve for gas payment (e.g., 100 USDC, 100 * 10^6)
export const USDC_GAS_APPROVAL_AMOUNT = BigInt(100_000_000);
const NFT_MINT_PRICE = BigInt(1_000_000); // 1 USDC for mint price (1 * 10^6)

export async function getNftMintBatchUOs(accountAddress: Address) {
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
    args: [DEMO_NFT_USDC_MINTABLE_ADDRESS, NFT_MINT_PRICE],
  });

  // 3. Mint the NFT to the smart account's address
  const mintCallData = encodeFunctionData({
    abi: nftAbi,
    functionName: "mintTo",
    args: [accountAddress],
  });

  return [
    {
      target: DEMO_USDC_ADDRESS_6_DECIMALS,
      data: approveGasSponsorshipCallData,
    },
    {
      target: DEMO_USDC_ADDRESS_6_DECIMALS,
      data: approveNftMintCallData,
    },
    {
      target: DEMO_NFT_USDC_MINTABLE_ADDRESS,
      data: mintCallData,
    },
  ];
}
