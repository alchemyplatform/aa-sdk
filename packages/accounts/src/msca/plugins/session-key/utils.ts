import {
  type Address,
  type ISmartAccountProvider,
  type ISmartContractAccount,
} from "@alchemy/aa-core";
import { SessionKeyPlugin } from "./plugin.js";

// find predecessors for each keys and returned the struct `ISessionKeyPlugin.SessionKeyToRemove[]`
// where SessionKeyToRemove = { sessionKey: Address, predecessor: Hex }
export const buildSessionKeysToRemoveStruct = async <
  P extends ISmartAccountProvider & { account: ISmartContractAccount }
>(
  provider: P,
  keys: ReadonlyArray<Address>
) => {
  const contract = SessionKeyPlugin.getContract(provider.rpcClient);
  return (
    await Promise.all(
      keys.map(async (key) => {
        return [
          key,
          await contract.read.findPredecessor([
            await provider.account.getAddress(),
            key,
          ]),
        ];
      })
    )
  ).map(([key, predecessor]) => ({
    sessionKey: key,
    predecessor,
  }));
};
