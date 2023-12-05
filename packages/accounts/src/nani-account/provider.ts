import { SmartAccountProvider } from "@alchemy/aa-core";
import { NaniAccount } from "./account.js";
import { NaniAccountProviderConfigSchema } from "./schema.js";
import type { NaniAccountProviderConfig } from "./types.ts";
import { getDefaultNaniAccountFactoryAddress } from "./utils.js";

export const createNaniAccountProvider = (
  config_: NaniAccountProviderConfig
): SmartAccountProvider & { account: NaniAccount } => {
  const config = NaniAccountProviderConfigSchema.parse(config_);

  return new SmartAccountProvider({
    rpcProvider: config.rpcProvider,
    chain: config.chain,
    entryPointAddress: config.entryPointAddress,
    opts: config.opts,
  }).connect(
    (rpcClient) =>
      new NaniAccount({
        rpcClient,
        initCode: config.initCode,
        owner: config.owner,
        chain: config.chain,
        entryPointAddress: config.entryPointAddress,
        factoryAddress:
          config.factoryAddress ??
          getDefaultNaniAccountFactoryAddress(config.chain),
        accountAddress: config.accountAddress,
        salt: config.salt,
        index: config.index,
      })
  );
};
