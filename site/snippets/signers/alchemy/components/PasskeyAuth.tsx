import { AlchemySigner } from "@account-kit/core";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

export const SignupComponent = () => {
  // It is recommended you wrap this in React Context or other state management
  // For this example, we are defining the Alchemy Signer in the component
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

  // we are using react-query to handle loading states more easily,
  // feel free to use whichever state management library you prefer
  const {
    mutate: login,
    isLoading,
    data: user,
  } = useMutation({
    mutationFn: () =>
      signer.authenticate({
        type: "passkey",
        createNew: false,
      }),
  });

  return (
    <div>
      {user == null || isLoading ? (
        <button onClick={() => login()}>Log in</button>
      ) : (
        <div>
          <div>Address: {user.address}</div>
          <div>Email: {user.email}</div>
        </div>
      )}
      <div id="turnkey-iframe-container" />
    </div>
  );
};
