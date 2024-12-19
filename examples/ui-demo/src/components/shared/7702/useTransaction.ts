import { useState } from "react";

export type TransactionStages = "initial" | "initiating" | "next" | "complete";
export type TransactionType = {
  state: TransactionStages;
  description: string;
  externalLink: string;
};

const initialState: TransactionType[] = [
  {
    state: "initial",
    description: "Bought 1 ETH for 4,000 USDC",
    externalLink: "www.alchemy.com",
  },
  {
    state: "initial",
    description: "Bought 1 ETH for 3,500 USDC",
    externalLink: "www.alchemy.com",
  },
  {
    state: "initial",
    description: "Bought 1 ETH for 4,200 USDC",
    externalLink: "www.alchemy.com",
  },
];

export const useTransactions = () => {
  const [transactions, setTransactions] =
    useState<TransactionType[]>(initialState);

  const [isLoading, setIsLoading] = useState(false);

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
    setTransactions((prev) => {
      const newState = [...prev];
      newState[transactionIndex].state = "complete";
      return newState;
    });
  };
  // Mock method to fire transactions for 7702
  const handleTransactions = async () => {
    console.log({ initialState });
    // initial state is mutated
    setIsLoading(true);
    setTransactions([
      {
        state: "initial",
        description: "Bought 1 ETH for 4,000 USDC",
        externalLink: "www.alchemy.com",
      },
      {
        state: "initial",
        description: "Bought 1 ETH for 3,500 USDC",
        externalLink: "www.alchemy.com",
      },
      {
        state: "initial",
        description: "Bought 1 ETH for 4,200 USDC",
        externalLink: "www.alchemy.com",
      },
    ]);
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
