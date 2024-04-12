import { useAddPasskey } from "@alchemy/aa-alchemy/react";

export function ComponentWithUser() {
  // Assumes you have a signer with an authenticated user
  const addPasskey = useAddPasskey();

  return (
    <div>
      <button onClick={() => addPasskey}>Add Passkey</button>
    </div>
  );
}
