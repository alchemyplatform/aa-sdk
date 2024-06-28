import type { GetAccountParameter, SmartContractAccount } from "@aa-sdk/core";
import { AccountNotFoundError } from "@aa-sdk/core";
import type { Address, Chain, Client, Transport } from "viem";
import { SessionKeyPlugin } from "./plugin.js";

type BuildSessionKeysToRemoveStructParams<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  keys: ReadonlyArray<Address>;
  pluginAddress?: Address;
} & GetAccountParameter<TAccount>;

/**
 * Finds predecessors for each provided key and returns them in the struct `ISessionKeyPlugin.SessionKeyToRemove[]`.
 *
 * @example
 * ```ts
 * import { buildSessionKeysToRemoveStruct } from "@account-kit/smart-contracts";
 *
 * const client = createSmartAccountClient(...);
 *
 * const keysToRemove = await buildSessionKeysToRemoveStruct(client, {
 *  keys: ["0x...", "0x..."],
 * });
 * ```
 *
 * @param {Client<TTransport, TChain, TAccount>} client The client instance used to interact with the smart account
 * @param {BuildSessionKeysToRemoveStructParams<TAccount>} args Arguments to configure the session key removal process
 * @returns {Promise<{ sessionKey: Address; predecessor: Address }[]>} A promise that resolves to an array of objects each containing a session key and its predecessor
 */
export async function buildSessionKeysToRemoveStruct<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: BuildSessionKeysToRemoveStructParams
): Promise<{ sessionKey: Address; predecessor: Address }[]> {
  const { keys, pluginAddress, account = client.account } = args;

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
}
