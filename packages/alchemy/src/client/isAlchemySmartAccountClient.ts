import {
  isSmartAccountClient,
  type EntryPointVersion,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import type { Chain, Client, Transport } from "viem";
import type { AlchemySmartAccountClient } from "./smartAccountClient";

export const isAlchemySmartAccountClient = <
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount<TEntryPointVersion> | undefined =
    | SmartContractAccount<TEntryPointVersion>
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
): client is AlchemySmartAccountClient<
  TEntryPointVersion,
  TTransport,
  TChain,
  TAccount
> => {
  // TODO: the goal of this check is to make sure that the client supports certain RPC methods
  // we should probably do this by checking the client's transport and configured URL, since alchemy
  // clients have to be RPC clients. this is difficult to do though because the transport might
  // point to a proxy url :/
  return isSmartAccountClient(client);
};
