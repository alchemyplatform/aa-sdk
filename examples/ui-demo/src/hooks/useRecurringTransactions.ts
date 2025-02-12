import { useState } from "react";
import type { BatchUserOperationCallData } from "@aa-sdk/core";
import {
  encodeFunctionData,
  toFunctionSelector,
  Hex,
  parseEther,
  getAbiItem,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  AllowlistModule,
  getDefaultAllowlistModuleAddress,
  getDefaultSingleSignerValidationModuleAddress,
  getDefaultTimeRangeModuleAddress,
  semiModularAccountBytecodeAbi,
  TimeRangeModule,
} from "@account-kit/smart-contracts/experimental";
import { SingleSignerValidationModule } from "@account-kit/smart-contracts/experimental";
import { useModularAccountV2Client } from "./useModularAccountV2Client";
import { DEMO_USDC_ADDRESS, SWAP_VENUE_ADDRESS } from "./7702/dca/constants";
import { swapAbi } from "./7702/dca/abi/swap";
import { erc20MintableAbi } from "./7702/dca/abi/erc20Mintable";
import { genEntityId } from "./7702/genEntityId";
import { odyssey, splitOdysseyTransport } from "./7702/transportSetup";
import { SESSION_KEY_VALIDITY_TIME_SECONDS } from "./7702/constants";

export type CardStatus = "initial" | "setup" | "active" | "done";

export type TransactionStages = "initial" | "initiating" | "next" | "complete";
export type TransactionType = {
  state: TransactionStages;
  buyAmountUsdc: number;
  externalLink?: string;
};

export const initialTransactions: TransactionType[] = [
  {
    state: "initiating",
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

export interface UseRecurringTransactionReturn {
  isLoadingClient: boolean;
  cardStatus: CardStatus;
  transactions: TransactionType[];
  handleTransactions: () => void;
}

export const useRecurringTransactions = ({
  mode,
}: {
  mode: "default" | "7702";
}): UseRecurringTransactionReturn => {
  const [transactions, setTransactions] =
    useState<TransactionType[]>(initialTransactions);

  const [cardStatus, setCardStatus] = useState<CardStatus>("initial");

  const [localSessionKey] = useState<Hex>(() => generatePrivateKey());
  const [sessionKeyEntityId] = useState<number>(() => genEntityId());
  const [sessionKeyAdded, setSessionKeyAdded] = useState<boolean>(false);

  const { client, isLoadingClient } = useModularAccountV2Client({
    mode,
    chain: odyssey,
    transport: splitOdysseyTransport,
  });

  const { client: sessionKeyClient } = useModularAccountV2Client({
    mode,
    chain: odyssey,
    transport: splitOdysseyTransport,
    localKeyOverride: {
      key: localSessionKey,
      entityId: sessionKeyEntityId,
      accountAddress: client?.getAddress(),
    },
  });

  const handleTransaction = async (transactionIndex: number) => {
    setTransactions((prev) => {
      const newState = [...prev];
      newState[transactionIndex].state = "initiating";
      if (transactionIndex + 1 < newState.length) {
        newState[transactionIndex + 1].state = "next";
      }
      return newState;
    });

    if (!sessionKeyClient) {
      console.error("no session key client");
      setCardStatus("initial");
      return;
    }

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
        console.log(e);
      });

    if (!txnHash) {
      setCardStatus("initial");
      return;
    }

    setTransactions((prev) => {
      const newState = [...prev];
      newState[transactionIndex].state = "complete";
      newState[transactionIndex].externalLink = odyssey.blockExplorers
        ? `${odyssey.blockExplorers?.default.url}/tx/${txnHash}`
        : undefined;
      return newState;
    });
  };

  // Mock method to fire transactions for 7702
  const handleTransactions = async () => {
    if (!client) {
      console.error("no client");
      return;
    }

    // initial state as referenced by `const initialTransactions` is mutated, so we need to re-create it.
    setTransactions([
      {
        state: "initiating",
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
    ]);
    setCardStatus("setup");

    // Start by minting the required USDC amount, and installing the session key, if not already installed.

    const currentEpochTimeSeconds = Math.floor(Date.now() / 1000);

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
      ...(sessionKeyAdded
        ? []
        : [
            {
              target: await client.getAddress(),
              data: await client.encodeInstallValidation({
                validationConfig: {
                  moduleAddress:
                    await getDefaultSingleSignerValidationModuleAddress(
                      odyssey
                    ),
                  entityId: sessionKeyEntityId,
                  isGlobal: false,
                  isSignatureValidation: false,
                  isUserOpValidation: true,
                },
                selectors: [
                  toFunctionSelector(
                    getAbiItem({
                      abi: semiModularAccountBytecodeAbi,
                      name: "execute",
                    })
                  ),
                ],
                installData: SingleSignerValidationModule.encodeOnInstallData({
                  entityId: sessionKeyEntityId,
                  signer: privateKeyToAccount(localSessionKey).address,
                }),
                hooks: [
                  AllowlistModule.buildHook(
                    {
                      entityId: sessionKeyEntityId,
                      inputs: [
                        {
                          target: SWAP_VENUE_ADDRESS,
                          hasSelectorAllowlist: true,
                          hasERC20SpendLimit: false,
                          erc20SpendLimit: BigInt(0),
                          selectors: [
                            toFunctionSelector(
                              getAbiItem({
                                abi: swapAbi,
                                name: "swapUSDCtoWETH",
                              })
                            ),
                          ],
                        },
                      ],
                    },
                    getDefaultAllowlistModuleAddress(odyssey)
                  ),
                  TimeRangeModule.buildHook(
                    {
                      entityId: sessionKeyEntityId,
                      validUntil:
                        currentEpochTimeSeconds +
                        SESSION_KEY_VALIDITY_TIME_SECONDS,
                      validAfter: 0,
                    },
                    getDefaultTimeRangeModuleAddress(odyssey)
                  ),
                ],
              }),
            },
          ]),
    ];

    const uoHash = await client.sendUserOperation({
      uo: batchActions,
    });

    const txnHash = await client
      .waitForUserOperationTransaction(uoHash)
      .catch((e) => {
        console.log(e);
      });

    if (!txnHash) {
      setCardStatus("initial");
      return;
    }

    setSessionKeyAdded(true);
    setCardStatus("active");

    for (let i = 0; i < transactions.length; i++) {
      await handleTransaction(i);
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
