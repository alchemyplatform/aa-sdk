import { useState } from "react";
import type { BatchUserOperationCallData } from "@aa-sdk/core";
import {
  encodeFunctionData,
  getAbiItem,
  Hex,
  parseEther,
  toFunctionSelector,
  type Chain,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { DEMO_USDC_ADDRESS, SWAP_VENUE_ADDRESS } from "./7702/dca/constants";
import { swapAbi } from "./7702/dca/abi/swap";
import { erc20MintableAbi } from "./7702/dca/abi/erc20Mintable";
import { useToast } from "@/hooks/useToast";
import { AlchemyTransport } from "@account-kit/infra";
import { useModularAccountV2Client } from "./useModularAccountV2Client";
import { useDeploymentStatus } from "@/hooks/useDeploymentStatus";
import { AccountMode } from "@/app/config";
import {
  deferralActions,
  PermissionBuilder,
  PermissionType,
} from "@account-kit/smart-contracts/experimental";
import { genEntityId } from "./7702/genEntityId";
import { SESSION_KEY_VALIDITY_TIME_SECONDS } from "./7702/constants";

export type CardStatus = "initial" | "setup" | "active" | "done";

export type TransactionStages = "initial" | "initiating" | "next" | "complete";
export type TransactionType = {
  state: TransactionStages;
  buyAmountUsdc: number;
  externalLink?: string;
  timeToBuy?: number; // timestamp when the txn should initiate
};

export const initialTransactions: TransactionType[] = [
  {
    state: "initial",
    buyAmountUsdc: 4000,
  },
  {
    state: "initial",
    buyAmountUsdc: 3500,
  },
  {
    state: "initial",
    buyAmountUsdc: 4200,
  },
];

export const RECURRING_TXN_INTERVAL = 10_000;

export interface UseRecurringTransactionReturn {
  isLoadingClient: boolean;
  cardStatus: CardStatus;
  transactions: TransactionType[];
  handleTransactions: () => void;
}

export const useRecurringTransactions = (clientOptions: {
  mode: AccountMode;
  chain: Chain;
  transport: AlchemyTransport;
}): UseRecurringTransactionReturn => {
  const [transactions, setTransactions] =
    useState<TransactionType[]>(initialTransactions);

  const [cardStatus, setCardStatus] = useState<CardStatus>("initial");

  const [sessionKey, setSessionKey] = useState<{
    privateKey: Hex;
    entityId: number;
    isGlobalValidation: boolean;
    isInstalled: boolean;
  }>({
    privateKey: generatePrivateKey(),
    entityId: genEntityId(),
    isGlobalValidation: false,
    isInstalled: false,
  });

  const { client, isLoadingClient } = useModularAccountV2Client({
    ...clientOptions,
  });

  const { client: sessionKeyClient } = useModularAccountV2Client({
    ...clientOptions,
    localKeyOverride: {
      privateKey: sessionKey.privateKey,
      entityId: sessionKey.entityId,
      accountAddress: client?.getAddress(),
      isGlobalValidation: sessionKey.isGlobalValidation,
    },
  });

  const { setToast } = useToast();

  const { isDeployed, refetch: refetchDeploymentStatus } =
    useDeploymentStatus();

  const handleError = (error: Error) => {
    console.error(error);
    setCardStatus("initial");
    setTransactions(initialTransactions);
    setToast({
      type: "error",
      text: "Something went wrong. Please try again.",
      open: true,
    });
  };

  const handleTransaction = async (transactionIndex: number) => {
    if (!sessionKeyClient) {
      return handleError(new Error("no session key client"));
    }

    setTransactions((prev) =>
      prev.map((txn, idx) =>
        idx === transactionIndex
          ? { ...txn, state: "initiating" }
          : idx === transactionIndex + 1
            ? {
                ...txn,
                state: "next",
                timeToBuy: Date.now() + RECURRING_TXN_INTERVAL,
              }
            : txn,
      ),
    );

    const usdcInAmount = transactions[transactionIndex].buyAmountUsdc;

    const uoHash = await sessionKeyClient.sendUserOperation({
      uo: {
        target: SWAP_VENUE_ADDRESS,
        data: encodeFunctionData({
          abi: swapAbi,
          functionName: "swapUSDCtoWETH",
          args: [parseEther(String(usdcInAmount)), parseEther("1")],
        }),
      },
    });

    const txnHash = await sessionKeyClient
      .waitForUserOperationTransaction(uoHash)
      .catch((e) => {
        console.error(e);
      });

    if (!txnHash) {
      return handleError(new Error("missing swap txn hash"));
    }

    setTransactions((prev) =>
      prev.map((txn, idx) =>
        idx === transactionIndex
          ? {
              ...txn,
              state: "complete",
              externalLink: clientOptions.chain.blockExplorers
                ? `${clientOptions.chain.blockExplorers.default.url}/tx/${txnHash}`
                : undefined,
            }
          : txn,
      ),
    );
  };

  // Mock method to fire transactions
  const handleTransactions = async () => {
    if (!client) {
      console.error("no client");
      return;
    }

    setTransactions(initialTransactions);
    setCardStatus("setup");

    // Start by minting the required USDC amount, and installing the session key, if not already installed.

    let installData: Hex | undefined;
    if (!sessionKey.isInstalled) {
      const currentEpochTimeSeconds = Math.floor(Date.now() / 1000);

      const _client = client.extend(deferralActions);

      const { entityId, nonce } = await _client.getEntityIdAndNonce({
        entityId: sessionKey.entityId,
        isGlobalValidation: sessionKey.isGlobalValidation,
      });

      const _installData = await new PermissionBuilder({
        client,
        key: {
          type: "secp256k1",
          publicKey: privateKeyToAccount(sessionKey.privateKey).address,
        },
        entityId,
        nonce,
        deadline: currentEpochTimeSeconds + SESSION_KEY_VALIDITY_TIME_SECONDS,
      })
        .addPermissions({
          permissions: [
            {
              type: PermissionType.FUNCTIONS_ON_CONTRACT,
              data: {
                address: SWAP_VENUE_ADDRESS,
                functions: [
                  toFunctionSelector(
                    getAbiItem({
                      abi: swapAbi,
                      name: "swapUSDCtoWETH",
                    }),
                  ),
                ],
              },
            },
          ],
        })
        .compileRaw();
      installData = _installData;
      setSessionKey((prev) => ({ ...prev, entityId }));
    }

    const batchActions: BatchUserOperationCallData = [
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
      // Only install the session key if it hasn't been installed yet
      ...(installData
        ? [
            {
              target: client.account.address,
              data: installData,
            },
          ]
        : []),
    ];

    const uoHash = await client.sendUserOperation({
      uo: batchActions,
    });

    const txnHash = await client
      .waitForUserOperationTransaction(uoHash)
      .catch((e) => {
        console.error(e);
      });

    if (!txnHash) {
      return handleError(new Error("missing batch txn hash"));
    }

    if (!isDeployed) {
      refetchDeploymentStatus();
    }
    setSessionKey((prev) => ({ ...prev, isInstalled: true }));
    setCardStatus("active");

    for (let i = 0; i < transactions.length; i++) {
      await Promise.all([
        handleTransaction(i),
        ...(i < transactions.length - 1
          ? [
              new Promise((resolve) =>
                setTimeout(resolve, RECURRING_TXN_INTERVAL),
              ),
            ]
          : []),
      ]);
    }

    setCardStatus("done");
  };

  return {
    isLoadingClient,
    cardStatus,
    transactions,
    handleTransactions,
  };
};
