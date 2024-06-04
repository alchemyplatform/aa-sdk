import { AlchemySigner } from "@account-kit/core";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export const SignupLoginComponent = () => {
  const [email, setEmail] = useState<string>("");

  // It is recommended you wrap this in React Context or other state management
  const signer = useMemo(
    () =>
      new AlchemySigner({
        client: {
          connection: {
            jwt: "alcht_<KEY>",
          },
          iframeConfig: {
            iframeContainerId: "turnkey-iframe-container",
          },
        },
      }),
    []
  );

  // we are using react-query to handle loading states more easily, but feel free to use w/e state management library you prefer
  const { mutate: loginOrSignup, isLoading } = useMutation({
    mutationFn: (email: string) =>
      signer.authenticate({ type: "email", email }),
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("bundle")) {
      // this will complete email auth
      signer
        .authenticate({ type: "email", bundle: urlParams.get("bundle")! })
        // redirect the user or do w/e you want once the user is authenticated
        .then(() => (window.location.href = "/"));
    }
  }, [signer]);

  // The below view allows you to collect the email from the user
  return (
    <>
      {!isLoading && (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={() => loginOrSignup(email)}>Submit</button>
        </div>
      )}
      <div id="turnkey-iframe-container" />
    </>
  );
};
