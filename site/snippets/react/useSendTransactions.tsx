import {
  useSendTransactions,
  useSmartAccountClient,
} from "@alchemy/aa-alchemy/react";
import { toHex } from "viem";

export function ComponentWithSendTransactions() {
  /**
   * Assumes the app has context of a signer with an authenticated user
   * by using the `AlchemyAccountProvider` from `@alchemy/aa-alchemy/react`.
   */
  const { client } = useSmartAccountClient({
    type: "MultiOwnerModularAccount",
  });
  const { sendTransactions, isSendingTransactions } = useSendTransactions({
    client,
    onSuccess: (hash) => {
      // [optional] Do something with the hash
    },
    onError: (error) => {
      // [optional] Do something with the error
    },
    // [optional] ...additional mutationArgs
  });

  return (
    <div>
      <button
        onClick={() =>
          sendTransactions({
            requests: [
              {
                from: "0xACCOUNT_ADDRESS",
                to: "0xTARGET_ADDRESS",
                data: "0x",
                value: toHex(0n),
              },
            ],
            // ... other parameters (account, context, overrides)
          })
        }
        disabled={isSendingTransactions}
      >
        {isSendingTransactions ? "Sending..." : "Send Txns"}
      </button>
    </div>
  );
}
