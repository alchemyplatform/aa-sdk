import {
  useSignMessage,
  useSmartAccountClient,
} from "@alchemy/aa-alchemy/react";
import { useState } from "react";

export function ComponentWithAddPasskey() {
  // Assumes the app has context of a signer with an authenticated user
  const [message, setMessage] = useState("");
  const client = useSmartAccountClient({
    type: "MultiOwnerModularAccount", // alternatively pass in "LightAccount",
    accountParams: {}, // optional param for overriding any account specific properties
  });
  const { signMessage, isSigningMessage } = useSignMessage(client);

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
