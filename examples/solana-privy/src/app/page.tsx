"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useConnectedStandardWallets,
  useCreateWallet,
} from "@privy-io/react-auth/solana";
import {
  createSolanaSmartWalletClient,
  alchemyWalletTransport,
} from "@alchemy/wallet-apis";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!;
const SOLANA_POLICY_ID = process.env.NEXT_PUBLIC_SOLANA_POLICY_ID!;
const SYSTEM_PROGRAM = "11111111111111111111111111111111";

export default function Home() {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useConnectedStandardWallets();
  const { createWallet } = useCreateWallet();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const solanaWallet = wallets[0];

  const handleSendCalls = async () => {
    if (!solanaWallet) return;

    setLoading(true);
    setStatus("Creating client...");

    try {
      const transport = alchemyWalletTransport({
        apiKey: ALCHEMY_API_KEY,
        url: "https://api.g.alchemypreview.com/v2",
      });

      const client = createSolanaSmartWalletClient({
        signer: solanaWallet,
        transport,
        chain: "solana:devnet",
        paymaster: { policyId: SOLANA_POLICY_ID },
      });

      setStatus("Sending calls (prepare -> sign -> send)...");

      // Transfer 0 lamports to self (simplest possible instruction)
      const transferData = "0x0200000000000000000000000000" as `0x${string}`;

      const sendResult = await client.sendCalls({
        calls: [
          {
            programId: SYSTEM_PROGRAM,
            accounts: [
              { pubkey: solanaWallet.address, isSigner: true, isWritable: true },
              { pubkey: solanaWallet.address, isSigner: false, isWritable: true },
            ],
            data: transferData,
          },
        ],
      });

      setStatus(`Call ID: ${sendResult.id}\n\nWaiting for confirmation...`);

      const result = await client.waitForCallsStatus({
        id: sendResult.id,
      });

      setStatus(
        `Status: ${result.status}\n` +
          `Status Code: ${result.statusCode}\n` +
          `Commitment: ${result.commitment ?? "N/A"}\n` +
          (result.receipts?.[0]
            ? `Signature: ${result.receipts[0].signature}`
            : ""),
      );
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 40, fontFamily: "monospace", maxWidth: 700 }}>
      <h1>Solana + Privy + Alchemy Smart Wallet</h1>

      {!authenticated ? (
        <button onClick={login}>Login with Privy</button>
      ) : (
        <div>
          <p>Logged in as: {user?.email?.address ?? user?.id}</p>
          {solanaWallet ? (
            <p>Solana wallet: {solanaWallet.address}</p>
          ) : (
            <div>
              <p>No Solana embedded wallet found.</p>
              <button onClick={() => createWallet()}>
                Create Solana Wallet
              </button>
            </div>
          )}

          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button onClick={handleSendCalls} disabled={!solanaWallet || loading}>
              {loading ? "Sending..." : "Send Sponsored SOL Transfer"}
            </button>
            <button onClick={logout}>Logout</button>
          </div>

          {status && (
            <pre
              style={{
                marginTop: 20,
                padding: 16,
                background: "#f0f0f0",
                borderRadius: 8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {status}
            </pre>
          )}
        </div>
      )}
    </main>
  );
}
