import { useSigner } from "@account-kit/react";

export function ComponentWithSigner() {
  const signer = useSigner();

  if (!signer) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Signer is ready!</h1>
      <div>{signer.inner.getUser()}</div>
    </div>
  );
}
