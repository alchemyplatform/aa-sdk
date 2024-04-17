import { useLogout } from "@alchemy/aa-alchemy/react";

export function ComponentWithLogout() {
  /**
   * Assumes the app has context of a signer with an authenticated user
   * by using the `AlchemyAccountProvider` from `@alchemy/aa-alchemy/react`.
   */
  const { logout } = useLogout();

  return (
    <div>
      <button onClick={() => logout}>Logout</button>
    </div>
  );
}
