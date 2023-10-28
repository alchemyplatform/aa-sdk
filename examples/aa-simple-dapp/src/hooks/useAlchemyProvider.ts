import { chain, gasManagerPolicyId } from "@/config/client";
import { getRpcUrl } from "@/config/rpc";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactory,
} from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  SmartAccountSigner,
  getDefaultEntryPointContract,
} from "@alchemy/aa-core";
import { useCallback, useEffect, useState } from "react";
import { Address } from "viem";

export const useAlchemyProvider = () => {
  const [lightAccountFactoryAddress, setLightAccountFactoryAddress] =
    useState<Address>();
  const [entryPointAddress, setEntryPointAddress] = useState<Address>();

  const [provider, setProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
      chain,
      rpcUrl: getRpcUrl(),
    })
  );

  useEffect(() => {
    if (!provider || entryPointAddress) return;

    (async () => {
      const [factoryAddress, entryPoint] = await Promise.all([
        getDefaultLightAccountFactory(chain),
        getDefaultEntryPointContract({ chain }),
      ]);
      setEntryPointAddress(entryPoint);
      setLightAccountFactoryAddress(factoryAddress);
    })();
  }, [entryPointAddress, provider]);

  const connectProviderToAccount = useCallback(
    (signer: SmartAccountSigner, account?: Address) => {
      if (lightAccountFactoryAddress == null || entryPointAddress == null) {
        return null;
      }

      const connectedProvider = provider
        .connect((provider) => {
          return new LightSmartContractAccount({
            rpcClient: provider,
            owner: signer,
            chain,
            entryPointAddress,
            factoryAddress: lightAccountFactoryAddress,
            accountAddress: account,
          });
        })
        .withAlchemyGasManager({
          policyId: gasManagerPolicyId,
        });

      setProvider(connectedProvider);
      return connectedProvider;
    },
    [entryPointAddress, lightAccountFactoryAddress, provider]
  );

  const disconnectProviderFromAccount = useCallback(() => {
    const disconnectedProvider = provider.disconnect();

    setProvider(disconnectedProvider);
    return disconnectedProvider;
  }, [provider]);

  return { provider, connectProviderToAccount, disconnectProviderFromAccount };
};
