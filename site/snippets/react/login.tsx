import { useAuthenticate } from "@alchemy/aa-alchemy/react";
import { useState } from "react";

export function Login() {
  const [email, setEmail] = useState("");
  const { authenticate, isPending } = useAuthenticate();

  return (
    <div>
      <input
        placeholder="enter your email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      ></input>
      <button
        onClick={() =>
          authenticate({
            type: "email",
            email,
          })
        }
        disabled={isPending}
      >
        {isPending ? "Loading..." : "Login"}
      </button>
    </div>
  );
}
