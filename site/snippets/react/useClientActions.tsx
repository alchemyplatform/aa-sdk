import { useClientActions, useSmartAccountClient } from "@account-kit/react";
import { sessionKeyPluginActions } from "@alchemy/aa-accounts";
import { zeroAddress } from "viem";

export function ComponentWithClientActions() {
  const { client } = useSmartAccountClient({
    type: "MultiOwnerModularAccount",
  });
  const { executeAction, data } = useClientActions({
    client,
    actions: sessionKeyPluginActions,
  });

  return (
    <div>
      <p>Is Session Key: {data != null ? !!data : "Click Button"}</p>
      <button
        onClick={() =>
          executeAction({
            functionName: "isAccountSessionKey",
            args: [{ key: zeroAddress }],
          })
        }
      >
        Check Key
      </button>
    </div>
  );
}
