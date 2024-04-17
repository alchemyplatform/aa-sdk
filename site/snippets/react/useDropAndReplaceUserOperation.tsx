import {
  useDropAndReplaceUserOperation,
  useSendUserOperation,
  useSmartAccountClient,
} from "@alchemy/aa-alchemy/react";

export function ComponentWithDropAndReplaceUO() {
  // Assumes the app has context of a signer with an authenticated user
  const { client } = useSmartAccountClient({
    type: "MultiOwnerModularAccount",
  });
  const { sendUserOperationAsync, isSendingUserOperation } =
    useSendUserOperation({
      client,
    });
  const { dropAndReplaceUserOperation, isDroppingAndReplacingUserOperation } =
    useDropAndReplaceUserOperation({
      client,
      onSuccess: ({ hash, request }) => {
        // [optional] Do something with the hash and request
      },
      onError: (error) => {
        // [optional] Do something with the error
      },
    });

  return (
    <div>
      <button
        onClick={async () => {
          const { request } = await sendUserOperationAsync({
            target: "0xTARGET_ADDRESS",
            data: "0x",
            value: 0n,
          });

          dropAndReplaceUserOperation({
            uoToDrop: request,
          });
        }}
        disabled={isSendingUserOperation || isDroppingAndReplacingUserOperation}
      >
        {isSendingUserOperation
          ? "Sending..."
          : isDroppingAndReplacingUserOperation
          ? "Replacing..."
          : "Send then Replace UO"}
      </button>
    </div>
  );
}
