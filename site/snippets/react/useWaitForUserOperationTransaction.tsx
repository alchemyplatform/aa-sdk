import {
  useSendUserOperation,
  useSmartAccountClient,
  useWaitForUserOperationTransaction,
} from "@alchemy/aa-alchemy/react";

export function ComponentWithWaitForUOTxn() {
  // Assumes the app has context of a signer with an authenticated user
  const { client } = useSmartAccountClient({
    type: "MultiOwnerModularAccount",
  });
  const { sendUserOperationAsync, isSendingUserOperation } =
    useSendUserOperation({
      client,
    });
  const {
    waitForUserOperationTransaction,
    isWaitingForUserOperationTransaction,
  } = useWaitForUserOperationTransaction({
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
        onClick={async () => {
          const { hash } = await sendUserOperationAsync({
            target: "0xTARGET_ADDRESS",
            data: "0x",
            value: 0n,
          });

          waitForUserOperationTransaction({
            hash: hash,
          });
        }}
        disabled={
          isSendingUserOperation || isWaitingForUserOperationTransaction
        }
      >
        {isSendingUserOperation
          ? "Sending..."
          : isWaitingForUserOperationTransaction
          ? "Waiting..."
          : "Send UO and wait for txn"}
      </button>
    </div>
  );
}
