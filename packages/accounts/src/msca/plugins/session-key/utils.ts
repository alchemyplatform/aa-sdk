import type {
  GetAccountParameter,
  SmartContractAccount,
} from "@alchemy/aa-core";
import { AccountNotFoundError } from "@alchemy/aa-core";
import type { Address, Chain, Client, Transport } from "viem";
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
  client: Client<TTransport, TChain, TAccount>,
  args: {
    keys: ReadonlyArray<Address>;
    pluginAddress?: Address;
  } & GetAccountParameter<TAccount>
) => Promise<{ sessionKey: Address; predecessor: Address }[]> = async (
  client,
  { keys, pluginAddress, account = client.account }
) => {
  if (!account) throw new AccountNotFoundError();

  const contract = SessionKeyPlugin.getContract(client, pluginAddress);
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
