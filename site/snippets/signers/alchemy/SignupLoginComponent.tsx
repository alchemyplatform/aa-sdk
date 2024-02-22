import { AlchemySigner } from "@alchemy/aa-alchemy";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { usePromise } from "./usePromise.js";

export const SignupLoginComponent = () => {
  // The usePromise hook is a helpful utility that makes it easier to resolve user's input after
  // a request has already been initiated
  const { promise: bundle, resolve } = usePromise<string>();
  const [email, setEmail] = useState<string>("");
  const [bundleInput, setBundleInput] = useState<string>("");

  // It is recommended you wrap this in React Context or other state management
  const signer = new AlchemySigner({
    client: {
      connection: {
        jwt: "alcht_<KEY>",
      },
      iframeConfig: {
        iframeContainerId: "turnkey-iframe-container",
      },
    },
  });

  // we are using react-query to handle loading states more easily, but feel free to use w/e state management library you prefer
  const { mutate: loginOrSignup, isLoading } = useMutation({
    mutationFn: (email: string) =>
      signer.authenticate({ type: "email", email, bundle }),
  });

  // The below view allows you to collect the email from the user and then the OTP bundle that they are emailed
  return (
    <>
      {!isLoading ? (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={() => loginOrSignup(email)}>Submit</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={bundleInput}
            onChange={(e) => setBundleInput(e.target.value)}
          />
          <button onClick={() => resolve(bundleInput)}>Submit</button>
        </div>
      )}
      <div id="turnkey-iframe-container" />
    </>
  );
};
