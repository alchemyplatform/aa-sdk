import type { SmartContractAccount } from "@alchemy/aa-core";
import type { Alchemy } from "alchemy-sdk";
import type { Chain, HttpTransport, Transport } from "viem";
import { AlchemySdkClientSchema } from "../../schema.js";
import type { AlchemySmartAccountClient } from "../smartAccountClient.js";

export type AlchemyEnhancedApis = {
  core: Alchemy["core"];
  nft: Alchemy["nft"];
  transact: Alchemy["transact"];
  debug: Alchemy["debug"];
  ws: Alchemy["ws"];
  notify: Alchemy["notify"];
  config: Alchemy["config"];
};

export const alchemyEnhancedApiActions: (
  alchemy: Alchemy
) => <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: AlchemySmartAccountClient<TTransport, TChain, TAccount>
) => AlchemyEnhancedApis = (alchemy) => (client) => {
  const alchemySdk = AlchemySdkClientSchema.parse(alchemy);

  if (client.transport.type === "http") {
    const { url } = client.transport as ReturnType<HttpTransport>["config"] &
      ReturnType<HttpTransport>["value"];

    if (
      client.transport.type === "http" &&
      alchemy.config.url &&
      alchemy.config.url !== url
    ) {
      throw new Error(
        "Alchemy SDK client JSON-RPC URL must match AlchemyProvider JSON-RPC URL"
      );
    }
  }

  return {
    core: alchemySdk.core,
    nft: alchemySdk.nft,
    transact: alchemySdk.transact,
    debug: alchemySdk.debug,
    ws: alchemySdk.ws,
    notify: alchemySdk.notify,
    config: alchemySdk.config,
  };
};
