import type { SmartContractAccount } from "@aa-sdk/core";
import type { Alchemy } from "alchemy-sdk";
import type { Chain } from "viem";
import { AlchemySdkClientSchema } from "./schema.js";
import type { AlchemySmartAccountClient } from "../client/smartAccountClient.js";

export type AlchemyEnhancedApis = {
  core: Alchemy["core"];
  nft: Alchemy["nft"];
  transact: Alchemy["transact"];
  debug: Alchemy["debug"];
  ws: Alchemy["ws"];
  notify: Alchemy["notify"];
  config: Alchemy["config"];
};

/**
 * Given an instance of the Alchemy SDK, returns a smart account client decorator which contains actions for interacting Alchemy's enhanced APIs.
 *
 * @example
 * ```ts
 * import { Alchemy } from "alchemy-sdk";
 * import { alchemyEnhancedApiActions } from "@account-kit/infra/enhanced-apis";
 * import { alchemySCAClient } from "./client";
 *
 * const alchemy = new Alchemy(...);
 * const enhancedApiDecorator = alchemyEnhancedApiActions(alchemy);
 * const withEnhancedApis = alchemySCAClient.extend(enhancedApiDecorator);
 * ```
 *
 * @param {Alchemy} alchemy The Alchemy instance containing the SDK client
 * @returns {(client: AlchemySmartAccountClient) => AlchemyEnhancedApis} A client decorator for Alchemy Smart Account clients that adds the enhanced API methods
 */
export function alchemyEnhancedApiActions(
  alchemy: Alchemy,
): <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
>(
  client: AlchemySmartAccountClient<TChain, TAccount>,
) => AlchemyEnhancedApis {
  return (client) => {
    const alchemySdk = AlchemySdkClientSchema.parse(alchemy);

    if (
      alchemy.config.url &&
      alchemy.config.url !== client.transport.alchemyRpcUrl
    ) {
      throw new Error(
        "Alchemy SDK client JSON-RPC URL must match AlchemyProvider JSON-RPC URL",
      );
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
}
