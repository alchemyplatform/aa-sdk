import { useSignMessage, useSmartAccountClient } from "@account-kit/react";
import { useState } from "react";

export function ComponentWithSignMessage() {
  /**
   * Assumes the app has context of a signer with an authenticated user
   * by using the `AlchemyAccountProvider` from `@alchemy/aa-alchemy/react`.
   */
  const [message, setMessage] = useState("");
  const client = useSmartAccountClient({
    type: "MultiOwnerModularAccount",
  });
  const { signMessage, isSigningMessage } = useSignMessage({
    client,
    onSuccess: (signature) => {
      // [optional] Do something with the signature
    },
    onError: (error) => {
      // [optional] Handle the error
    },
    // [optional] ...additional mutationArgs
  });

  return (
    <div>
      <input
        placeholder="enter your message to sign..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></input>
      <button
        onClick={() => signMessage({ message })}
        disabled={isSigningMessage}
      >
        {isSigningMessage ? "Signing..." : "Sign Message"}
      </button>
    </div>
  );
}
