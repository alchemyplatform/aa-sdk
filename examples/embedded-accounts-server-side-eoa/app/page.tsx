"use client";
import {
  useAuthModal,
  useLogout,
  useSigner,
  useSignerStatus,
  useUser,
} from "@account-kit/react";
import { useEffect, useState } from "react";
import { hashMessage } from "viem";

export default function Home() {
  const user = useUser();
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout();
  const signer = useSigner();

  const [createdApiKey, setCreatedApiKey] = useState(false);

  useEffect(() => {
    if (!user || !signer || !signerStatus.isConnected || createdApiKey) {
      return;
    }

    const stampWhoAmI = async () => {
      console.log("Stamping whoami...");
      const stamp = await signer.inner.stampWhoami();
      const resp = await fetch("/api/whoami", {
        method: "POST",
        body: JSON.stringify(stamp),
      });
      return (await resp.json()) as { publicKey: string };
    };

    const createApiKey = async (publicKey: string) => {
      console.log("Creating api key...");
      await signer.inner.createApiKey({
        name: `server-signer-${new Date().getTime()}`,
        publicKey,
        expriationSec: 60 * 60 * 24 * 30, // 30 days
      });
    };

    stampWhoAmI().then(({ publicKey }) => {
      createApiKey(publicKey).then(() => {
        setCreatedApiKey(true);
      });
    });
  }, [createdApiKey, signer, signerStatus.isConnected, user]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-4 justify-center text-center">
      {signerStatus.isInitializing ? (
        <>Loading...</>
      ) : user ? (
        <div className="flex flex-col gap-2 p-2">
          <p className="text-xl font-bold">Success!</p>
          <p>Logged in as {user.email ?? "anon"}.</p>
          <p>{user.address}</p>

          <button
            className="btn btn-primary mt-6"
            onClick={async () => {
              const org = await signer?.inner.getOrganization();
              console.log(org);
              window.alert(JSON.stringify(org, null, 2));
            }}
          >
            Get org info
          </button>
          <button
            className="btn btn-primary mt-6 disabled:opacity-70"
            disabled={!createdApiKey}
            onClick={async () => {
              const hash = hashMessage("hello world");
              const resp = await fetch("/api/sign", {
                method: "POST",
                body: JSON.stringify({ orgId: user.orgId, payload: hash }),
              });
              const respJson = await resp.json();
              console.log(respJson);
              window.alert(JSON.stringify(respJson, null, 2));
            }}
          >
            Sign message
          </button>
          <button className="btn btn-primary mt-6" onClick={() => logout()}>
            Log out
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={openAuthModal}>
          Login
        </button>
      )}
    </main>
  );
}
