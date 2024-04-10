import { useAccount } from "@alchemy/aa-alchemy/react";

export function ComponentUsingAccount() {
  // If this is the first time the hook is called, then the client will be undefined until the underlying account is connected to the client
  const { isLoadingAccount, account } = useAccount({
    type: "LightAccount", // alternatively pass in "MultiOwnerModularAccount",
    accountParams: {}, // optional param for overriding any account specific properties
  });

  if (isLoadingAccount || !account) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Account is ready!</h1>
      <div>{account.address}</div>
    </div>
  );
}
