import { useAuthenticate } from "@account-kit/react";
import { useState } from "react";

export function Login() {
  const [email, setEmail] = useState("");
  const { authenticate, isPending } = useAuthenticate({
    onSuccess: (user) => {
      // [optional] Do something with the user info
    },
    onError: (error) => {
      // [optional] Do something with the error
    },
  });

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
