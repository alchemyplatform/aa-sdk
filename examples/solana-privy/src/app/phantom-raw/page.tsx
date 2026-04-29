"use client";

import { useState } from "react";
import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import {
  createSmartWalletClient,
  alchemyWalletTransport,
} from "@alchemy/wallet-apis";
import { fromWalletAdapter } from "@alchemy/wallet-apis/solana";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!;
const SOLANA_POLICY_ID = process.env.NEXT_PUBLIC_SOLANA_POLICY_ID!;
const SYSTEM_PROGRAM = "11111111111111111111111111111111";

interface PhantomProvider {
  isPhantom?: boolean;
  publicKey: PublicKey | null;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction<T extends VersionedTransaction>(transaction: T): Promise<T>;
}

function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const phantom = (window as any).phantom?.solana;
  return phantom?.isPhantom ? phantom : null;
}

export default function PhantomRawPage() {
  const [provider, setProvider] = useState<PhantomProvider | null>(null);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    const phantom = getPhantomProvider();
    if (!phantom) {
      setStatus(
        "Phantom wallet not found. Please install the Phantom browser extension.",
      );
      return;
    }
    try {
      const { publicKey } = await phantom.connect();
      setProvider(phantom);
      setAddress(publicKey.toBase58());
    } catch (err) {
      setStatus(
        `Connection failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const handleDisconnect = async () => {
    await provider?.disconnect();
    setProvider(null);
    setAddress("");
    setStatus("");
  };

  const handleSendCalls = async () => {
    if (!provider || !address) return;
    setLoading(true);
    setStatus("Creating client...");

    try {
      const signer = fromWalletAdapter(provider);

      const transport = alchemyWalletTransport({
        apiKey: ALCHEMY_API_KEY,
        url: "https://api.g.alchemypreview.com/v2",
      });

      const client = createSmartWalletClient({
        signer,
        transport,
        chain: "solana:devnet",
        paymaster: { policyId: SOLANA_POLICY_ID },
      });

      setStatus("Sending calls (prepare -> sign -> send)...");

      const transferData = "0x0200000000000000000000000000" as `0x${string}`;

      const sendResult = await client.sendCalls({
        calls: [
          {
            programId: SYSTEM_PROGRAM,
            accounts: [
              { pubkey: address, isSigner: true, isWritable: true },
              { pubkey: address, isSigner: false, isWritable: true },
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
      <h1>Phantom (Raw) + Alchemy Smart Wallet</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Connects directly to <code>window.phantom.solana</code> without any
        wallet adapter library. The Phantom provider is wrapped into a{" "}
        <code>SolanaSigner</code> via <code>fromWalletAdapter</code>.
      </p>

      {!address ? (
        <button onClick={handleConnect}>Connect Phantom</button>
      ) : (
        <div>
          <p>Connected: {address}</p>
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button onClick={handleSendCalls} disabled={loading}>
              {loading ? "Sending..." : "Send Sponsored SOL Transfer"}
            </button>
            <button onClick={handleDisconnect}>Disconnect</button>
          </div>
        </div>
      )}

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
    </main>
  );
}
