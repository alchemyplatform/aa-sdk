import type {
  EntryPointVersion,
  GetAccountParameter,
  SmartContractAccount,
} from "@alchemy/aa-core";
import { AccountNotFoundError, type Address } from "@alchemy/aa-core";
import type { Chain, Client, Transport } from "viem";
import { SessionKeyPlugin } from "./plugin.js";

// find predecessors for each keys and returned the struct `ISessionKeyPlugin.SessionKeyToRemove[]`
// where SessionKeyToRemove = { sessionKey: Address, predecessor: Hex }
export const buildSessionKeysToRemoveStruct: <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: {
    keys: ReadonlyArray<Address>;
    pluginAddress?: Address;
  } & GetAccountParameter<TEntryPointVersion, TAccount>
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
