import {
  useSendUserOperation,
  useSmartAccountClient,
} from "@alchemy/aa-alchemy/react";

export function ComponentWithSendUserOperation() {
  // Assumes the app has context of a signer with an authenticated user
  const { client } = useSmartAccountClient({
    type: "MultiOwnerModularAccount",
  });
  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
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
        disabled={isSendingUserOperation}
      >
        {isSendingUserOperation ? "Sending..." : "Send UO"}
      </button>
    </div>
  );
}
