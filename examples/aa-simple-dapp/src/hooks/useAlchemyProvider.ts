import {
  chain,
  gasManagerPolicyId,
  lightAccountFactoryAddress,
} from "@/config/client";
import { getRpcUrl } from "@/config/rpc";
import { LightSmartContractAccount } from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { SmartAccountSigner } from "@alchemy/aa-core";
import { useCallback, useState } from "react";
import { Address } from "viem";

type AlchemyProviderProps = {
  entryPointAddress: Address;
};

export const useAlchemyProvider = ({
  entryPointAddress,
}: AlchemyProviderProps) => {
  const [provider, setProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
      chain,
      entryPointAddress,
      rpcUrl: getRpcUrl(),
    })
  );

  const connectProviderToAccount = useCallback(
    (signer: SmartAccountSigner, account?: Address) => {
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
          entryPoint: entryPointAddress,
        });

      setProvider(connectedProvider);
      return connectedProvider;
    },
    [entryPointAddress, provider]
  );

  const disconnectProviderFromAccount = useCallback(() => {
    const disconnectedProvider = provider.disconnect();

    setProvider(disconnectedProvider);
    return disconnectedProvider;
  }, [provider]);

  return { provider, connectProviderToAccount, disconnectProviderFromAccount };
};
