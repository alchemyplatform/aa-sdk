import {
  getDefaultLightAccountFactoryAddress,
  LightSmartContractAccount,
} from "@alchemy/aa-accounts";
import { LightAccountAlchemyProviderConfigSchema } from "../schema.js";
import type { LightAccountAlchemyProviderConfig } from "../type.js";
import { AlchemyProvider } from "./base.js";

/**
 * This method improves the developer experience of connecting a Light Account to an
 * AlchemyProvider via an optional dependency on the `@alchemy/aa-accounts` package.
 * @see: https://github.com/alchemyplatform/alchemy-sdk-js
 *
 * @param config_ - the AlchemyProvder configuration with additional pamaeters for Light Account
 * @returns - a new AlchemyProvider connected to a Light Account
 */
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
