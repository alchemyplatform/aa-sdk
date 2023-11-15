import { SmartAccountProvider } from "@alchemy/aa-core";
import { LightSmartContractAccount } from "./account.js";
import { LightAccountProviderConfigSchema } from "./schema.js";
import type { LightAccountProviderConfig } from "./types.js";
import { getDefaultLightAccountFactoryAddress } from "./utils.js";

export const createLightAccountProvider = (
  config_: LightAccountProviderConfig
): SmartAccountProvider & { account: LightSmartContractAccount } => {
  const config = LightAccountProviderConfigSchema.parse(config_);

  return new SmartAccountProvider({
    rpcProvider: config.rpcProvider,
    chain: config.chain,
    entryPointAddress: config.entryPointAddress,
    opts: config.opts,
  }).connect(
    (rpcClient) =>
      new LightSmartContractAccount({
        rpcClient,
        initCode: config.initCode,
        owner: config.owner,
        chain: config.chain,
        entryPointAddress: config.entryPointAddress,
        factoryAddress:
          config.factoryAddress ??
          getDefaultLightAccountFactoryAddress(config.chain),
        accountAddress: config.accountAddress,
      })
  );
};
