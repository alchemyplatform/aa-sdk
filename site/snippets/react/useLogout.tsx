import { useLogout } from "@alchemy/aa-alchemy/react";

export function ComponentWithLogout() {
  // Assumes the app has context of a signer with an authenticated user
  const { logout } = useLogout();

  return (
    <div>
      <button onClick={() => logout}>Logout</button>
    </div>
  );
}
