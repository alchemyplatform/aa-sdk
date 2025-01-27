import { useState } from "react";
import type { BatchUserOperationCallData } from "@aa-sdk/core";
import { useSma7702Client } from "./useSma7702Client";
import { SWAP_VENUE_ADDRESS, DEMO_USDC_ADDRESS } from "./dca/constants";
import { swapAbi } from "./dca/abi/swap";
import { erc20MintableAbi } from "./dca/abi/erc20Mintable";
import { encodeFunctionData, toFunctionSelector, Hex, parseEther } from "viem";
import { ODYSSEY_EXPLORER_URL } from "./constants";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  getDefaultSingleSignerValidationModuleAddress,
  semiModularAccountBytecodeAbi,
  serializeModuleEntity,
} from "@account-kit/smart-contracts/experimental";
import { odyssey } from "./transportSetup";
import { genEntityId } from "./genEntityId";
import { SingleSignerValidationModule } from "@account-kit/smart-contracts/experimental";

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

  const [localSessionKey] = useState<Hex>(() => generatePrivateKey());
  const [sessionKeyEntityId] = useState<number>(() => genEntityId());
  const [sessionKeyAdded, setSessionKeyAdded] = useState<boolean>(false);

  const client = useSma7702Client();

  const sessionKeyClient = useSma7702Client({
    key: localSessionKey,
    entityId: sessionKeyEntityId,
    accountAddress: client?.getAddress(),
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

    // console.log({ initialState });
    // initial state is mutated
    setIsLoading(true);
    setTransactions(initialState);

    // Start by minting the required USDC amount, and installing the session key, if not already installed.

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
                    "function execute(address target, uint256 value, bytes calldata data)"
                  ),
                ],
                installData: SingleSignerValidationModule.encodeOnInstallData({
                  entityId: sessionKeyEntityId,
                  signer: privateKeyToAccount(localSessionKey).address,
                }),
                hooks: [],
              }),
            },
          ]),
    ];

    // if (!sessionKeyAdded) {
    //   console.log("Installing session key");
    //   console.log("Local session key addr: ", privateKeyToAccount(localSessionKey).address);
    //   console.log("Session key entity id: ", sessionKeyEntityId);
    // }

    const uoHash = await client.sendUserOperation({
      uo: batchActions,
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

    setSessionKeyAdded(true);

    // // stall for 20s, to see if the bundler just hasn't updated state yet
    // await new Promise((resolve) => setTimeout(resolve, 10000));

    // // View the install state of the session key
    // const ethCallResult = await client.readContract({
    //   address: await client.getAddress(),
    //   abi: semiModularAccountBytecodeAbi,
    //   functionName: 'getValidationData',
    //   args: [
    //     serializeModuleEntity({
    //       moduleAddress: await getDefaultSingleSignerValidationModuleAddress(odyssey),
    //       entityId: sessionKeyEntityId,
    //     }),
    //   ]
    // })

    // console.log("Session key install state: ", ethCallResult);

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
