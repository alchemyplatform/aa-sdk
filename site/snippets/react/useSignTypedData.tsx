import {
  useSignTypedData,
  useSmartAccountClient,
} from "@alchemy/aa-alchemy/react";
import { useState } from "react";

export function ComponentWithSignTypedData() {
  /**
   * Assumes the app has context of a signer with an authenticated user
   * by using the `AlchemyAccountProvider` from `@alchemy/aa-alchemy/react`.
   */
  const [typedDataMessage, setTypedDataMessage] = useState("");
  const client = useSmartAccountClient({
    type: "MultiOwnerModularAccount",
  });
  const { signTypedData, isSigningTypedData } = useSignTypedData({
    client,
    onSuccess: (signature) => {
      // Do something with the signature
    },
    onError: (error) => {
      // Handle the error
    },
    // [optional] ...additional mutationArgs
  });

  return (
    <div>
      <input
        placeholder="enter your typed data message to sign..."
        value={typedDataMessage}
        onChange={(e) => setTypedDataMessage(e.target.value)}
      ></input>
      <button
        onClick={() =>
          signTypedData({
            typedData: {
              types: {
                Mail: [
                  { name: "from", type: "string" },
                  { name: "to", type: "string" },
                  { name: "contents", type: "string" },
                ],
              },
              primaryType: "Mail",
              message: {
                from: "Alice",
                to: "Bob",
                contents: typedDataMessage,
              },
            },
          })
        }
        disabled={isSigningTypedData}
      >
        {isSigningTypedData ? "Signing..." : "Sign Typed Data"}
      </button>
    </div>
  );
}
