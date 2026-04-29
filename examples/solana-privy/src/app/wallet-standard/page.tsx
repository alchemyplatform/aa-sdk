"use client";

import { useEffect, useState } from "react";
import { getWallets } from "@wallet-standard/app";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
import {
  createSmartWalletClient,
  alchemyWalletTransport,
} from "@alchemy/wallet-apis";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!;
const SOLANA_POLICY_ID = process.env.NEXT_PUBLIC_SOLANA_POLICY_ID!;
const SYSTEM_PROGRAM = "11111111111111111111111111111111";

const CONNECT = "standard:connect";
const DISCONNECT = "standard:disconnect";
const SIGN_TX = "solana:signTransaction";

function isSolanaSignWallet(wallet: Wallet): boolean {
  return CONNECT in wallet.features && SIGN_TX in wallet.features;
}

export default function WalletStandardPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [activeWallet, setActiveWallet] = useState<Wallet | null>(null);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const api = getWallets();
    setWallets(api.get().filter(isSolanaSignWallet));

    const off = api.on("register", (...added) => {
      setWallets((prev) => [...prev, ...added.filter(isSolanaSignWallet)]);
    });
    return off;
  }, []);

  const handleConnect = async (wallet: Wallet) => {
    try {
      const { accounts } = await (
        wallet.features[CONNECT] as {
          connect: () => Promise<{ accounts: readonly WalletAccount[] }>;
        }
      ).connect();
      const acct = accounts[0] ?? wallet.accounts[0];
      if (!acct) {
        setStatus("No accounts returned by wallet.");
        return;
      }
      setActiveWallet(wallet);
      setAccount(acct);
    } catch (err) {
      setStatus(
        `Connection failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  const handleDisconnect = async () => {
    if (activeWallet && DISCONNECT in activeWallet.features) {
      await (
        activeWallet.features[DISCONNECT] as { disconnect: () => Promise<void> }
      ).disconnect();
    }
    setActiveWallet(null);
    setAccount(null);
    setStatus("");
  };

  const handleSendCalls = async () => {
    if (!activeWallet || !account) return;
    setLoading(true);
    setStatus("Creating client...");

    try {
      const { signTransaction } = activeWallet.features[SIGN_TX] as {
        signTransaction: (
          ...inputs: { account: WalletAccount; transaction: Uint8Array }[]
        ) => Promise<{ signedTransaction: Uint8Array }[]>;
      };

      // wallet-standard signTransaction already speaks Uint8Array in/out —
      // just pass the account through and unwrap the single-element array
      const signer = {
        address: account.address,
        signTransaction: async ({
          transaction,
        }: {
          transaction: Uint8Array;
        }) => {
          const [output] = await signTransaction({ account, transaction });
          return output;
        },
      };

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
              { pubkey: account.address, isSigner: true, isWritable: true },
              { pubkey: account.address, isSigner: false, isWritable: true },
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
      <h1>Wallet Standard + Alchemy Smart Wallet</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Uses <code>@wallet-standard/app</code> to discover installed wallets
        directly. No Privy, no wallet adapter library — the wallet&apos;s{" "}
        <code>solana:signTransaction</code> feature already returns{" "}
        <code>Uint8Array</code>, matching <code>SolanaSigner</code> with no
        serialization adapter needed.
      </p>

      {!account ? (
        <div>
          <p>Detected wallets:</p>
          {wallets.map((w) => (
            <button
              key={w.name}
              onClick={() => handleConnect(w)}
              style={{ marginRight: 8, marginTop: 8 }}
            >
              Connect {w.name}
            </button>
          ))}
          {wallets.length === 0 && (
            <p>
              No Solana wallets detected. Install Phantom or another
              wallet-standard wallet.
            </p>
          )}
        </div>
      ) : (
        <div>
          <p>
            Connected via <strong>{activeWallet?.name}</strong>:{" "}
            {account.address}
          </p>
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
