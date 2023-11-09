import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { SmartAccountProvider } from "@alchemy/aa-core";
import { LightSmartContractAccount } from "../account.js";
import { getDefaultLightAccountFactoryAddress } from "../utils.js";
import type {
  LightAccountAlchemyProviderConfig,
  LightAccountProviderConfig,
} from "./types.js";

export const createLightAccountAlchemyProvider = (
  config: LightAccountAlchemyProviderConfig
): AlchemyProvider & { account: LightSmartContractAccount } => {
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

export const createLightAccountProvider = (
  config: LightAccountProviderConfig
): SmartAccountProvider & { account: LightSmartContractAccount } => {
  return new SmartAccountProvider(config).connect(
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
