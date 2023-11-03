import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { type SmartAccountSigner } from "@alchemy/aa-core";
import { AlchemyProvider } from "./provider.js";
import type { AlchemyProviderConfig } from "./type.js";

export const createAlchemyLightAccountProvider = (
  // TODO: clean up this type
  opts: AlchemyProviderConfig & { owner: SmartAccountSigner }
): AlchemyProvider & { account: LightSmartContractAccount } => {
  return new AlchemyProvider(opts).connect(
    (rpcClient) =>
      new LightSmartContractAccount({
        rpcClient,
        owner: opts.owner,
        chain: opts.chain,
        entryPointAddress: opts.entryPointAddress,
        factoryAddress: getDefaultLightAccountFactoryAddress(opts.chain),
      })
  );
};
