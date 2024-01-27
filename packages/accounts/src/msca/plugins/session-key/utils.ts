import { type Address } from "@alchemy/aa-core";
import type {
  GetAccountParameter,
  SmartAccountClient,
  SmartContractAccount,
} from "@alchemy/aa-core/viem";
import type { Chain, PublicClient, Transport } from "viem";
import { SessionKeyPlugin } from "./plugin.js";

// find predecessors for each keys and returned the struct `ISessionKeyPlugin.SessionKeyToRemove[]`
// where SessionKeyToRemove = { sessionKey: Address, predecessor: Hex }
export const buildSessionKeysToRemoveStruct: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>,
  args: { keys: ReadonlyArray<Address> } & GetAccountParameter<TAccount>
) => Promise<{ sessionKey: Address; predecessor: Address }[]> = async (
  client,
  { keys, account = client.account }
) => {
  if (!account) throw new Error("Account is required");

  const contract = SessionKeyPlugin.getContract(client as PublicClient);
  return (
    await Promise.all(
      keys.map(async (key) => {
        return [
          key,
          await contract.read.findPredecessor([account.address, key]),
        ];
      })
    )
  ).map(([key, predecessor]) => ({
    sessionKey: key,
    predecessor,
  }));
};
