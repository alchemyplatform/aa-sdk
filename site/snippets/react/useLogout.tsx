import { useLogout } from "@account-kit/react";

export function ComponentWithLogout() {
  /**
   * Assumes the app has context of a signer with an authenticated user
   * by using the `AlchemyAccountProvider` from `@alchemy/aa-alchemy/react`.
   */
  const { logout } = useLogout({
    onSuccess: () => {
      // [optional] Do something after the user has been logged out
    },
    onError: (error) => {
      // [optional] Do something with the error
    },
    // [optional] ...additional mutationArgs
  });

  return (
    <div>
      <button onClick={() => logout}>Logout</button>
    </div>
  );
}
