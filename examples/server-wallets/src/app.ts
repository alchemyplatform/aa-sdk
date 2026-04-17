import 'dotenv/config'

import { createServerSigner, generateAccessKey } from "@account-kit/signer";
import { createSmartWalletClient } from "@account-kit/wallet-client";
import { raise } from './util';
import { alchemy, baseSepolia } from '@account-kit/infra';

const envConfig = {
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY ?? raise("ALCHEMY_API_KEY is not set"),
  ALCHEMY_RPC_API_KEY: process.env.ALCHEMY_RPC_API_KEY ?? process.env.ALCHEMY_API_KEY ?? raise("ALCHEMY_RPC_API_KEY is not set"),
  ALCHEMY_GAS_MANAGER_POLICY_ID: process.env.ALCHEMY_GAS_MANAGER_POLICY_ID ?? raise("ALCHEMY_GAS_MANAGER_POLICY_ID is not set"),
  ALCHEMY_API_URL: process.env.ALCHEMY_API_URL,
}

const transport = alchemy({
  apiKey: envConfig.ALCHEMY_RPC_API_KEY
})

async function app() {
  const accessKey = generateAccessKey()
  console.log("🔑 Access key generated:", accessKey);

  const signer = await createServerSigner({
    auth: {
      accessKey
    },
    connection: {
      jwt: envConfig.ALCHEMY_API_KEY,
      rpcUrl: envConfig.ALCHEMY_API_URL,
    },
  })

  const client = createSmartWalletClient({
    transport,
    chain: baseSepolia,
    signer,
    policyId: envConfig.ALCHEMY_GAS_MANAGER_POLICY_ID,
  });
  
  const account = await client.requestAccount();
  console.log("🧩 Using account:", account.address);

  const { id } = await client.sendCalls({
    calls: [{ to: "0x0000000000000000000000000000000000000000", value: "0x0" }],
    from: account.address
  });
  console.log("🚀 Call sent:", id);

  const { receipts } = await client.waitForCallsStatus({ id });
  console.log("✨ Landed in tx:", receipts?.[0].transactionHash);
}

app()