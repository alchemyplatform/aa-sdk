import {
  useSendTransaction,
  useSmartAccountClient,
} from "@alchemy/aa-alchemy/react";
import { sepolia } from "@alchemy/aa-core";

export function ComponentWithSendTransaction() {
  /**
   * Assumes the app has context of a signer with an authenticated user
   * by using the `AlchemyAccountProvider` from `@alchemy/aa-alchemy/react`.
   */
  const { client } = useSmartAccountClient({
    type: "MultiOwnerModularAccount",
  });
  const { sendTransaction, isSendingTransaction } = useSendTransaction({
    client,
    onSuccess: (hash) => {
      // [optional] Do something with the hash
    },
    onError: (error) => {
      // [optional] Do something with the error
    },
  });

  return (
    <div>
      <button
        onClick={() =>
          sendTransaction({
            to: "0xTARGET_ADDRESS",
            data: "0x",
            value: 0n,
            account: "0xACCOUNT_ADDRESS",
            chain: sepolia,
            // ... other parameters
          })
        }
        disabled={isSendingTransaction}
      >
        {isSendingTransaction ? "Sending..." : "Send Txn"}
      </button>
    </div>
  );
}
