import { AlchemySigner } from "@alchemy/aa-alchemy";
import { useMutation } from "@tanstack/react-query";

// It is recommended you wrap the Alchemy Signer in React Context or other state management
// For this example, we are passing in an authenticated signer as a component prop
export const AddPasskeyComponent = (signer: AlchemySigner) => {
  // we are using react-query to handle loading states more easily,
  // feel free to use whichever state management library you prefer
  const {
    mutate: login,
    isLoading,
    data: authenticatorIds,
  } = useMutation({
    mutationFn: () => signer.addPasskey(),
  });

  return (
    <div>
      {authenticatorIds == null || isLoading ? (
        <button onClick={() => login()}>Log in</button>
      ) : (
        authenticatorIds.map((authenticatorId) => (
          <div key={authenticatorId}>Authenticator ID: {authenticatorId}</div>
        ))
      )}
      <div id="turnkey-iframe-container" />
    </div>
  );
};
