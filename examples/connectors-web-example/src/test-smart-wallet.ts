import { getConnectorClient } from "@wagmi/core";
import { createSmartWalletClient } from "@alchemy/wallet-apis";
import { alchemyTransport } from "@alchemy/common";
import { config } from "./wagmi.js";
import { Account, Chain, Transport, WalletClient, zeroAddress } from "viem";

// TODO(v5): remove this once we have a smart wallet wagmi connector.
export async function testSmartWalletWithConnectorClient() {
  const policyId = import.meta.env.VITE_PAYMASTER_POLICY_ID;
  if (!policyId) {
    throw new Error("VITE_PAYMASTER_POLICY_ID is not set");
  }

  const connectorClient = await getConnectorClient(config);
  console.log("Got connector client:", connectorClient);

  const smartWalletClient = createSmartWalletClient({
    signer: connectorClient as WalletClient<Transport, Chain, Account>,
    transport: alchemyTransport({
      url: `https://api.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
    }),
    chain: connectorClient.chain,
  });
  console.log("Smart wallet client created:", smartWalletClient);

  const { address } = await smartWalletClient.requestAccount({
    // Alchemy connector client supports 7702,
    // but some other connectors may not.
    creationHint:
      connectorClient.account.type === "local"
        ? { accountType: "7702" }
        : undefined,
  });
  console.log("Requested account:", address);

  const { preparedCallIds } = await smartWalletClient.sendCalls({
    from: address,
    calls: [
      {
        to: zeroAddress,
        value: "0x0",
      },
    ],
    capabilities: {
      paymasterService: {
        policyId,
      },
    },
  });
  console.log("Sent calls:", preparedCallIds);

  const status = await smartWalletClient.waitForCallsStatus({
    id: preparedCallIds[0],
  });
  console.log(status);

  return status.status;
}
