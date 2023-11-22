import { chain, gasManagerPolicyId } from "@/config/client";
import { getRpcUrl } from "@/config/rpc";
import { createMultiOwnerMSCA } from "@alchemy/aa-accounts";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  SmartAccountSigner,
  getDefaultEntryPointAddress,
} from "@alchemy/aa-core";
import { useCallback, useState } from "react";
import { Address } from "viem";

export const useAlchemyProvider = () => {
  const [provider, setProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
      chain,
      rpcUrl: getRpcUrl(),
    })
  );

  const connectProviderToAccount = useCallback(
    (signer: SmartAccountSigner, account?: Address) => {
      const connectedProvider = provider
        .connect((provider) => {
          return createMultiOwnerMSCA({
            rpcClient: provider,
            owner: signer,
            chain,
            entryPointAddress: getDefaultEntryPointAddress(chain),
            factoryAddress: "0xFD14c78640d72f73CC88238E2f7Df3273Ee84043",
            accountAddress: account,
          });
        })
        .withAlchemyGasManager({
          policyId: gasManagerPolicyId,
        });

      setProvider(connectedProvider);
      return connectedProvider;
    },
    [provider]
  );

  const disconnectProviderFromAccount = useCallback(() => {
    const disconnectedProvider = provider.disconnect();

    setProvider(disconnectedProvider);
    return disconnectedProvider;
  }, [provider]);

  return { provider, connectProviderToAccount, disconnectProviderFromAccount };
};
