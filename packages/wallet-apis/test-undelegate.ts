import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { zeroAddress } from "viem";
import { createSmartWalletClient } from "./src/client.js";
import { alchemyWalletTransport } from "./src/transport.js";

// TODO(jh): remove this after done testing manually.

// Configure these:
const API_KEY = process.env.TEST_ALCHEMY_API_KEY ?? "";
const WALLET_API_URL = "http://localhost:3000";
const POLICY_ID = process.env.TEST_PAYMASTER_POLICY_ID ?? "";

if (!API_KEY) throw new Error("TEST_ALCHEMY_API_KEY is required");
if (!POLICY_ID) throw new Error("TEST_PAYMASTER_POLICY_ID is required");

const transport = alchemyWalletTransport({
  apiKey: API_KEY,
  url: WALLET_API_URL,
});

const signer = privateKeyToAccount(generatePrivateKey());
console.log("Signer:", signer.address);

const client = createSmartWalletClient({
  transport,
  chain: baseSepolia,
  signer,
});

async function main() {
  // 1. Delegate via 7702 sendCalls
  console.log("Requesting 7702 account...");
  const account = await client.requestAccount({
    creationHint: { accountType: "7702" },
  });
  console.log("Account:", account.address);

  console.log("Sending delegation tx...");
  const sendResult = await client.sendCalls({
    calls: [{ to: zeroAddress, value: 0n }],
    account,
    capabilities: {
      paymaster: { policyId: POLICY_ID },
    },
  });
  console.log("Send id:", sendResult.id);

  const sendStatus = await client.waitForCallsStatus({ id: sendResult.id });
  console.log("Send status:", sendStatus.status);

  // 2. Undelegate
  console.log("\nUndelegating...");
  const undelegateResult = await client.undelegateAccount();
  console.log("Undelegate id:", undelegateResult.id);

  const undelegateStatus = await client.waitForCallsStatus({
    id: undelegateResult.id,
  });
  console.log("Undelegate status:", undelegateStatus);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
