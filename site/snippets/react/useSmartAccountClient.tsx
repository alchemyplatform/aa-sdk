import { useSmartAccountClient } from "@account-kit/react";

export function ComponentUsingClient() {
  // If this is the first time the hook is called, then the client will be undefined until the underlying account is connected to the client
  const { isLoadingClient, client } = useSmartAccountClient({
    type: "MultiOwnerModularAccount", // alternatively pass in "LightAccount",
    accountParams: {}, // optional param for overriding any account specific properties
  });

  if (isLoadingClient || !client) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Client is ready!</h1>
      <div>{client.account.address}</div>
    </div>
  );
}
