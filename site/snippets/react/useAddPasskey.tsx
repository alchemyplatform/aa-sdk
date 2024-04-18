import { useAddPasskey } from "@alchemy/aa-alchemy/react";

export function ComponentWithAddPasskey() {
  /**
   * Assumes the app has context of a signer with an authenticated user
   * by using the `AlchemyAccountProvider` from `@alchemy/aa-alchemy/react`.
   */
  const addPasskey = useAddPasskey({
    onSuccess: (authenticatorIds) => {
      // [optional] Do something with the authenticatorIds
    },
    onError: (error) => {
      // [optional] Do something with the error
    },
    // [optional] ...additional mutationArgs
  });

  return (
    <div>
      <button onClick={() => addPasskey}>Add Passkey</button>
    </div>
  );
}
