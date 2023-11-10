import {
  getDefaultLightAccountFactoryAddress,
  LightSmartContractAccount,
} from "@alchemy/aa-accounts";
import { LightAccountAlchemyProviderConfigSchema } from "../schema.js";
import type { LightAccountAlchemyProviderConfig } from "../type.js";
import { AlchemyProvider } from "./base.js";

export const createLightAccountAlchemyProvider = (
  config: LightAccountAlchemyProviderConfig
): AlchemyProvider & { account: LightSmartContractAccount } => {
  LightAccountAlchemyProviderConfigSchema.parse(config);

  return new AlchemyProvider(config).connect(
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
