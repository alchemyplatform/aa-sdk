import { useAddPasskey } from "@alchemy/aa-alchemy/react";

export function ComponentWithAddPasskey() {
  // Assumes the app has context of a signer with an authenticated user
  const addPasskey = useAddPasskey();

  return (
    <div>
      <button onClick={() => addPasskey}>Add Passkey</button>
    </div>
  );
}
