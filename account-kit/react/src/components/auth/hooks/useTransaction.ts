import { useState } from "react";

export enum TransactionStatus {
  none = "none",
  pending = "pending",
  success = "success",
  error = "error",
}

export interface Transaction {
  title: string;
  status: TransactionStatus;
}

export interface TransactionConfig {
  stepsNumber?: number;
}

export interface UseTransaction {
  makeRequest: () => void;
  result: Transaction[];
  reset: () => void;
}

const randomDelay = (min = 2, max = 6) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay * 1000;
};

export const useTransaction = (
  { stepsNumber = 3 }: TransactionConfig = { stepsNumber: 3 }
): UseTransaction => {
  const baseRequest = Array.from({ length: stepsNumber }).map(
    (_item, index) => ({
      title: `Transaction ${index + 1}`,
      status: TransactionStatus.none,
    })
  );

  const [result, setResult] = useState(baseRequest);

  const reset = () => {
    setResult(baseRequest);
  };

  const simulateApiCall = async (
    transaction: Transaction
  ): Promise<Transaction> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...transaction, status: TransactionStatus.success });
      }, randomDelay());
    });
  };

  const makeRequest = async () => {
    for (let i = 0; i < result.length; i++) {
      const response = await simulateApiCall(result[i]);

      setResult((prevState) => {
        const newState = [...prevState];
        newState[i] = response;
        return newState;
      });
    }
  };

  const startRequest = () => {
    setResult((prevState) => {
      return [...prevState].map((item) => ({
        ...item,
        status: TransactionStatus.pending,
      }));
    });

    makeRequest();
  };

  return {
    makeRequest: startRequest,
    result,
    reset,
  };
};
