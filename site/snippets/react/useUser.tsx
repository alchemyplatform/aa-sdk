import { useUser } from "@alchemy/aa-alchemy/react";

export function ComponentWithUser() {
  const user = useUser();

  return (
    <div>
      <h1>
        {user
          ? `User connected with signer address: ${user.address}`
          : "No user connected"}
      </h1>
    </div>
  );
}
