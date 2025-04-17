import { useConfigStore } from "@/state";
import { MFACard } from "./MFACard";
import { MintCard } from "./MintCard";
import { SolanaCard } from "./SolanaCard";
import { TransactionsCard } from "./TransactionsCard";
import { useSigner } from "@account-kit/react";

export const SmallCardsWrapper = () => {
  const { accountMode } = useConfigStore();
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:my-6 items-center w-full">
      <MintCard accountMode={accountMode} key={`mint-card-${accountMode}`} />
      <TransactionsCard
        accountMode={accountMode}
        key={`transactions-card-${accountMode}`}
      />
      <SolanaCard />
      <MFACard />
      <ApiKeyCard />
    </div>
  );
};

const ApiKeyCard = () => {
  const signer = useSigner();

  return (
    <div className="flex flex-col gap-4 bg-bg-surface-inset p-6 rounded-lg shadow-sm h-full">
      API key
      <button
        onClick={async () => {
          if (!signer) {
            alert("No signer");
            return;
          }
          const keys = (await (await fetch("/api/generate-key")).json()) as {
            privateKey: string;
            publicKey: string;
          };
          console.log(keys); // TODO(jh): remove
          signer.inner.addApiKey({
            name: `test-${new Date().getTime()}`,
            publicKey: keys.publicKey,
            expirationSec: 60 * 60 * 24 * 365 * 100, // 100 years
          });
        }}
      >
        Generate & install
      </button>
    </div>
  );
};

// const generateKeyPair = async () => {
//   const keyPair = await crypto.subtle.generateKey(
//     {
//       name: "ECDH",
//       namedCurve: "P-256", // equivalent to prime256v1
//     },
//     true, // extractable
//     ["deriveKey", "deriveBits"],
//   );

//   const publicKeyRaw = await crypto.subtle.exportKey(
//     "raw", // raw, spki, or pkcs8
//     keyPair.publicKey,
//   );
//   const privateKeyPkcs8 = await crypto.subtle.exportKey(
//     "pkcs8",
//     keyPair.privateKey,
//   );

//   return {
//     publicKey: Buffer.from(publicKeyRaw).toString("hex"), // uncompressed (65 bytes)
//     privateKey: Buffer.from(privateKeyPkcs8).toString("hex"), // full PKCS#8 structure
//   };
// };
