import { LightSmartContractAccount } from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  type PublicErc4337Client,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { useCallback, useState } from "react";
import {
  alchemyRpcUrl,
  chain,
  gasManagerPolicyId,
  lightAccountFactoryAddress,
} from "shared/config/env";
import { getAddress, type Address, type HttpTransport } from "viem";

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
      rpcUrl: alchemyRpcUrl,
    }),
  );

  const connectProviderToAccount = useCallback(
    (signer: SmartAccountSigner, account?: Address) => {
      const connectedProvider = provider
        .connect(
          (rpcClient: string | PublicErc4337Client<HttpTransport>) =>
            new LightSmartContractAccount({
              rpcClient,
              owner: signer,
              chain,
              entryPointAddress,
              factoryAddress: lightAccountFactoryAddress,
              accountAddress: account,
            }),
        )
        .withAlchemyGasManager({
          policyId: gasManagerPolicyId,
          entryPoint: entryPointAddress,
        });

      setProvider(connectedProvider);

      console.log(
        "[useAlchemyProvider] Alchemy Provider connected to account %s \
        (Signer type %s, Gas Manager Policy ID %s, Entry Point Address %s, Factory Address %s)",
        connectedProvider.account,
        signer.signerType,
        gasManagerPolicyId,
        entryPointAddress,
        lightAccountFactoryAddress,
      );

      return connectedProvider;
    },
    [entryPointAddress, provider],
  );

  const disconnectProviderFromAccount = useCallback(() => {
    const disconnectedProvider = provider.disconnect();

    setProvider(disconnectedProvider);
    return disconnectedProvider;
  }, [provider]);

  return {
    provider,
    getAddress,
    connectProviderToAccount,
    disconnectProviderFromAccount,
  };
};
