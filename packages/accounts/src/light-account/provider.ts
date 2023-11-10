import { SmartAccountProvider } from "@alchemy/aa-core";
import { LightSmartContractAccount } from "./account.js";
import { LightAccountProviderConfigSchema } from "./schema.js";
import type { LightAccountProviderConfig } from "./types.js";
import { getDefaultLightAccountFactoryAddress } from "./utils.js";

export const createLightAccountProvider = (
  config: LightAccountProviderConfig
): SmartAccountProvider & { account: LightSmartContractAccount } => {
  LightAccountProviderConfigSchema.parse(config);

  return new SmartAccountProvider({
    rpcProvider: config.rpcProvider,
    chain: config.chain,
    entryPointAddress: config.entryPointAddress,
    opts: config.opts,
  }).connect(
    (rpcClient) =>
      new LightSmartContractAccount({
        rpcClient,
        owner: config.owner,
        chain: config.chain,
        entryPointAddress: config.entryPointAddress,
        factoryAddress: getDefaultLightAccountFactoryAddress(config.chain),
        accountAddress: config.accountAddress,
      })
  );
};
