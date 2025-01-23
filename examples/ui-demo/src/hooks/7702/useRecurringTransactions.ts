import { useState } from "react";
import { useSma7702Client } from "./useSma7702Client";
import { SWAP_VENUE_ADDRESS, DEMO_USDC_ADDRESS } from "./dca/constants";
import { swapAbi } from "./dca/abi/swap";
import { erc20MintableAbi } from "./dca/abi/erc20Mintable";
import { encodeFunctionData, parseEther } from "viem";
import { ODYSSEY_EXPLORER_URL } from "./constants";

export type TransactionStages = "initial" | "initiating" | "next" | "complete";
export type TransactionType = {
  state: TransactionStages;
  buyAmountUsdc: number;
  externalLink: string;
};

const initialState: TransactionType[] = [
  {
    state: "initial",
    buyAmountUsdc: 4000,
    externalLink: "www.alchemy.com",
  },
  {
    state: "initial",
    buyAmountUsdc: 3500,
    externalLink: "www.alchemy.com",
  },
  {
    state: "initial",
    buyAmountUsdc: 4200,
    externalLink: "www.alchemy.com",
  },
];

export const useRecurringTransactions = () => {
  const [transactions, setTransactions] =
    useState<TransactionType[]>(initialState);

  const [isLoading, setIsLoading] = useState(false);

  const client = useSma7702Client();

  const handleTransaction = async (transactionIndex: number) => {
    setTransactions((prev) => {
      const newState = [...prev];
      newState[transactionIndex].state = "initiating";
      if (transactionIndex + 1 < newState.length) {
        newState[transactionIndex + 1].state = "next";
      }
      return newState;
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (!client) {
      console.error("no client");
      return;
    }

    const usdcInAmount = transactions[transactionIndex].buyAmountUsdc;

    const uoHash = await client.sendUserOperation({
      uo: {
        target: SWAP_VENUE_ADDRESS,
        data: encodeFunctionData({
          abi: swapAbi,
          functionName: "swapUSDCtoWETH",
          args: [parseEther(String(usdcInAmount)), parseEther("1")],
        }),
      },
    });

    const txnHash = await client
      .waitForUserOperationTransaction(uoHash)
      .catch((e) => {
        console.log(e);
      });

    if (!txnHash) {
      setTransactions(initialState);
      setIsLoading(false);
      return;
    }

    setTransactions((prev) => {
      const newState = [...prev];
      newState[transactionIndex].state = "complete";
      newState[
        transactionIndex
      ].externalLink = `${ODYSSEY_EXPLORER_URL}/tx/${txnHash}`;
      return newState;
    });
  };
  // Mock method to fire transactions for 7702
  const handleTransactions = async () => {
    if (!client) {
      console.error("no client");
      return;
    }

    console.log({ initialState });
    // initial state is mutated
    setIsLoading(true);
    setTransactions(initialState);

    // Start by minting the required USDC amount.

    const uoHash = await client.sendUserOperation({
      uo: [
        {
          target: DEMO_USDC_ADDRESS,
          data: encodeFunctionData({
            abi: erc20MintableAbi,
            functionName: "mint",
            args: [client.getAddress(), parseEther("11700")], // mint 11,700 USDC
          }),
        },
        {
          target: DEMO_USDC_ADDRESS,
          data: encodeFunctionData({
            abi: erc20MintableAbi,
            functionName: "approve",
            args: [SWAP_VENUE_ADDRESS, parseEther("11700")], // approve 11,700 USDC
          }),
        },
      ],
    });

    const txnHash = await client
      .waitForUserOperationTransaction(uoHash)
      .catch((e) => {
        console.log(e);
      });

    if (!txnHash) {
      setIsLoading(false);
      return;
    }

    for (let i = 0; i < transactions.length; i++) {
      await handleTransaction(i);
    }

    setIsLoading(false);
  };

  return {
    transactions,
    handleTransactions,
    isLoading,
  };
};
