import {
  getDefaultLightAccountFactoryAddress,
  LightSmartContractAccount,
} from "@alchemy/aa-accounts";
import { LightAccountAlchemyProviderConfigSchema } from "../schema.js";
import type { LightAccountAlchemyProviderConfig } from "../type.js";
import { AlchemyProvider } from "./base.js";

export const createLightAccountAlchemyProvider = (
  config_: LightAccountAlchemyProviderConfig
): AlchemyProvider & { account: LightSmartContractAccount } => {
  const config = LightAccountAlchemyProviderConfigSchema.parse(config_);

  return new AlchemyProvider(config).connect(
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
