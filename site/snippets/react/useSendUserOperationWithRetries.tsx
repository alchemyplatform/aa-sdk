import {
  useDropAndReplace,
  useSendUserOperation,
  useSmartAccountClient,
} from "@account-kit/react";
import { WaitForUserOperationError } from "@alchemy/aa-core";

export function ComponentWithSendUserOperation() {
  /**
   * Assumes the app has context of a signer with an authenticated user
   * by using the `AlchemyAccountProvider` from `@alchemy/aa-alchemy/react`.
   */
  const { client } = useSmartAccountClient({
    type: "MultiOwnerModularAccount",
  });
  // [!code ++:3]
  const { dropAndReplace, isDroppingAndReplacingUserOperation } =
    useDropAndReplace({ client });

  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true, // [!code ++:6]
    onError: (error) => {
      if (error instanceof WaitForUserOperationError) {
        dropAndReplace({ uoToDrop: error.request });
      }
    },
  });

  return (
    <div>
      <button
        onClick={() =>
          sendUserOperation({
            target: "0xTARGET_ADDRESS",
            data: "0x",
            value: 0n,
          })
        }
        disabled={isSendingUserOperation || isDroppingAndReplacingUserOperation} // [!code ++]
      >
        {isSendingUserOperation ? "Sending..." : "Send UO"}
      </button>
    </div>
  );
}
