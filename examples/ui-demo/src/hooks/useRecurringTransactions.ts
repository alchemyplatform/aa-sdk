import { useState } from "react";
import { BatchUserOperationCallData } from "@aa-sdk/core";
import {
  SWAP_VENUE_ADDRESS,
  DEMO_USDC_ADDRESS,
} from "@/hooks/7702/dca/constants";
import { swapAbi } from "@/hooks/7702/dca/abi/swap";
import { erc20MintableAbi } from "@/hooks/7702/dca/abi/erc20Mintable";
import {
  encodeFunctionData,
  toFunctionSelector,
  Hex,
  parseEther,
  getAbiItem,
} from "viem";
import {
  ODYSSEY_EXPLORER_URL,
  SESSION_KEY_VALIDITY_TIME_SECONDS,
} from "@/hooks/7702/constants";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  AllowlistModule,
  getDefaultAllowlistModuleAddress,
  getDefaultSingleSignerValidationModuleAddress,
  getDefaultTimeRangeModuleAddress,
  semiModularAccountBytecodeAbi,
  TimeRangeModule,
  SingleSignerValidationModule,
} from "@account-kit/smart-contracts/experimental";
import { genEntityId } from "@/hooks/7702/genEntityId";
import { useSmartAccountClient } from "@account-kit/react";
import { odysseyTestnet } from "@/hooks/7702/transportSetup";
export type CardStatus = "initial" | "setup" | "active" | "done";

export type TransactionStages = "initial" | "initiating" | "next" | "complete";
export type TransactionType = {
  state: TransactionStages;
  buyAmountUsdc: number;
  externalLink: string;
};

// TODO(jh): share this shared config somewhere?
const initialTransactions: TransactionType[] = [
  {
    state: "initiating",
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
    useState<TransactionType[]>(initialTransactions);

  const [cardStatus, setCardStatus] = useState<CardStatus>("initial");

  const [localSessionKey] = useState<Hex>(() => generatePrivateKey());
  const [sessionKeyEntityId] = useState<number>(() => genEntityId());
  const [sessionKeyAdded, setSessionKeyAdded] = useState<boolean>(false);

  const { client, isLoadingClient } = useSmartAccountClient({
    type: "ModularAccountV2",
  });

  // TODO(jh): seems like useSmartAccountClient doesn't currently support a custom signer.
  const [sessionKeyClient, setSessionKeyClient] = useState<
    Client | undefined
  >();

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

    // initial state as referenced by `const initialTransactions` is mutated, so we need to re-create it.
    setTransactions([
      {
        state: "initiating",
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
                      odysseyTestnet
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
                    getDefaultAllowlistModuleAddress(odysseyTestnet)
                  ),
                  TimeRangeModule.buildHook(
                    {
                      entityId: sessionKeyEntityId,
                      validUntil:
                        currentEpochTimeSeconds +
                        SESSION_KEY_VALIDITY_TIME_SECONDS,
                      validAfter: 0,
                    },
                    getDefaultTimeRangeModuleAddress(odysseyTestnet)
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
