import { useSignerStatus } from "@account-kit/react";

export function ComponentWithSignerStatus() {
  const { status } = useSignerStatus();

  return (
    <div>
      <h1>Signer Status: {status}</h1>
    </div>
  );
}
