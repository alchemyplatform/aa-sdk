import {
  isSmartAccountClient,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import type { Chain, Client, Transport } from "viem";
import type { AlchemySmartAccountClient } from "./smartAccountClient";

export const isAlchemySmartAccountClient = <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
): client is AlchemySmartAccountClient<TTransport, TChain, TAccount> => {
  return (
    isSmartAccountClient(client) && client.type === "AlchemySmartAccountClient"
  );
};
