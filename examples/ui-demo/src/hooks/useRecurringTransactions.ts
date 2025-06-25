import { useDeploymentStatus } from "@/hooks/useDeploymentStatus";
import { useToast } from "@/hooks/useToast";
import { LocalAccountSigner } from "@aa-sdk/core";
import { AlchemyTransport } from "@account-kit/infra";
import {
  useAccount,
  useChain,
  useSigner,
  useSmartAccountClient,
} from "@account-kit/react";
import {
  useSendCalls,
  useSmartWalletClient,
} from "@account-kit/react/experimental";
import { semiModularAccountBytecodeAbi } from "@account-kit/smart-contracts/experimental";
import { useEffect, useState } from "react";
import {
  encodeFunctionData,
  getAbiItem,
  Hex,
  parseEther,
  slice,
  toFunctionSelector,
  type Chain,
} from "viem";
import { generatePrivateKey, privateKeyToAddress } from "viem/accounts";
import { SESSION_KEY_VALIDITY_TIME_SECONDS } from "./7702/constants";
import { erc20MintableAbi } from "./7702/dca/abi/erc20Mintable";
import { swapAbi } from "./7702/dca/abi/swap";
import { DEMO_USDC_ADDRESS, SWAP_VENUE_ADDRESS } from "./7702/dca/constants";

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
  mode: "default" | "7702";
  chain: Chain;
  transport: AlchemyTransport;
}): UseRecurringTransactionReturn => {
  const [transactions, setTransactions] =
    useState<TransactionType[]>(initialTransactions);

  const [cardStatus, setCardStatus] = useState<CardStatus>("initial");

  const [localSessionKey] = useState<Hex>(() => generatePrivateKey());
  const [sessionKeyAdded, setSessionKeyAdded] = useState<boolean>(false);

  const { chain: currentChain, setChain } = useChain();
  const signer = useSigner();

  useEffect(() => {
    if (currentChain.id !== clientOptions.chain.id) {
      setChain({ chain: clientOptions.chain });
    }
  }, [currentChain.id, clientOptions.chain.id, setChain, clientOptions.chain]);

  const { isLoadingAccount, address } = useAccount({
    type: "ModularAccountV2",
    accountParams: {
      mode: clientOptions.mode,
    },
  });

  const smartWalletClient = useSmartWalletClient({
    account: address,
  });

  const sessionKeySmartWalletClient = useSmartWalletClient({
    account: address,
    signer: LocalAccountSigner.privateKeyToAccountSigner(localSessionKey),
  });
  const { sendCallsAsync: sendCallsSessionKey } = useSendCalls({
    client: sessionKeySmartWalletClient,
  });

  const { client, isLoadingClient } = useSmartAccountClient({});

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
    if (!client) {
      return handleError(new Error("no client"));
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

    const { ids } = await sendCallsSessionKey({
      calls: [
        {
          to: SWAP_VENUE_ADDRESS,
          data: encodeFunctionData({
            abi: swapAbi,
            functionName: "swapUSDCtoWETH",
            args: [parseEther(String(usdcInAmount)), parseEther("1")],
          }),
        },
      ],
    });
    const uoHash = slice(ids[0], 32);

    const txnHash = await client
      .waitForUserOperationTransaction({ hash: uoHash })
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
    if (
      !smartWalletClient ||
      !sessionKeySmartWalletClient ||
      !client ||
      !signer
    ) {
      console.error("no client");
      return;
    }

    setTransactions(initialTransactions);
    setCardStatus("setup");

    let context: Hex | undefined;
    if (!sessionKeyAdded) {
      let { context: sessionKeyContext } =
        await smartWalletClient.grantPermissions(
          // this should not be required when using the decorator because the decorator uses the client's signer! (note: the decorator is correctly doing this, but the types are wrong here)
          signer,
          {
            key: {
              publicKey: privateKeyToAddress(localSessionKey),
              type: "secp256k1",
            },
            permissions: [
              {
                type: "account-functions",
                data: {
                  functions: [
                    toFunctionSelector(
                      getAbiItem({
                        abi: semiModularAccountBytecodeAbi,
                        name: "execute",
                      }),
                    ),
                  ],
                },
              },
              {
                type: "contract-function-access",
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
              {
                type: "contract-access",
                data: {
                  address: DEMO_USDC_ADDRESS,
                },
              },
            ],
            // why is this required? grant permissions should also be using the chain id of the client already
            chainId: clientOptions.chain.id,
            // wtf why is this on here too?
            entityId: undefined,
            expirySec: SESSION_KEY_VALIDITY_TIME_SECONDS,
          },
        );

      context = sessionKeyContext;
      setSessionKeyAdded(true);
    }

    const { ids } = await sendCallsSessionKey({
      calls: [
        {
          to: DEMO_USDC_ADDRESS,
          data: encodeFunctionData({
            abi: erc20MintableAbi,
            functionName: "mint",
            args: [client.getAddress(), parseEther("11700")], // mint 11,700 USDC
          }),
        },
        {
          to: DEMO_USDC_ADDRESS,
          data: encodeFunctionData({
            abi: erc20MintableAbi,
            functionName: "approve",
            args: [SWAP_VENUE_ADDRESS, parseEther("11700")], // approve 11,700 USDC
          }),
        },
      ],
      ...(context
        ? {
            capabilities: {
              permissions: {
                context,
              },
            },
          }
        : {}),
    });

    const uoHash = slice(ids[0], 32);

    const txnHash = await client
      .waitForUserOperationTransaction({ hash: uoHash })
      .catch((e) => {
        console.error(e);
      });

    if (!txnHash) {
      return handleError(new Error("missing batch txn hash"));
    }

    if (!isDeployed) {
      refetchDeploymentStatus();
    }
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
    isLoadingClient: isLoadingAccount || isLoadingClient,
    cardStatus,
    transactions,
    handleTransactions,
  };
};
