import type { AlchemyWebSigner } from "@account-kit/signer";
import { useSigner, useSignerStatus } from "@account-kit/react";
import { useState, useEffect } from "react";
import {
  createModularAccountV2Client,
  ModularAccountV2Client,
} from "@account-kit/smart-contracts";
import { alchemyFeeEstimator, AlchemyTransport } from "@account-kit/infra";
import {
  installValidationActions,
  InstallValidationActions,
} from "@account-kit/smart-contracts/experimental";
import { Chain, Hex, Address, PrivateKeyAccount } from "viem";
import { LocalAccountSigner } from "@aa-sdk/core";
import { privateKeyToAccount } from "viem/accounts";

type Client = ModularAccountV2Client<
  AlchemyWebSigner | LocalAccountSigner<PrivateKeyAccount>
> &
  InstallValidationActions<
    AlchemyWebSigner | LocalAccountSigner<PrivateKeyAccount>
  >;

// Hook that creates an MAv2 client that can be used for things that
// @account-kit/react doesn't yet support, such as session keys.
export const useModularAccountV2Client = ({
  mode,
  chain,
  transport,
  localKeyOverride,
}: {
  mode: "7702" | "default";
  chain: Chain;
  transport: AlchemyTransport;
  localKeyOverride?: {
    readonly key: Hex;
    readonly entityId: number;
    readonly accountAddress?: Address;
  };
}): {
  client: Client | undefined;
  isLoadingClient: boolean;
  isError: boolean;
} => {
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [isLoadingClient, setIsLoadingClient] = useState(true);
  const [isError, setError] = useState(false);

  const signer = useSigner();
  const { isConnected } = useSignerStatus();

  // Must destructure the inner fields to use as dependencies in the useEffect hook, otherwise the object reference will be compared and cause an infinite render loop
  const { key, entityId, accountAddress } = localKeyOverride ?? {};

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!signer || !isConnected) {
        return;
      }

      if (key != null && accountAddress == null) {
        // We have an override present but don't have the account to set it for, so leave the client as undefined until we get the account address override.
        return;
      }

      try {
        const _client = (
          await createModularAccountV2Client({
            mode,
            chain,
            transport,
            accountAddress,
            signer: key
              ? new LocalAccountSigner(privateKeyToAccount(key))
              : signer,
            signerEntity: entityId
              ? {
                  isGlobalValidation: false,
                  entityId,
                }
              : undefined,
            feeEstimator: alchemyFeeEstimator(transport),
            policyId: process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID!,
          })
        ).extend(installValidationActions);

        if (!isMounted) {
          return;
        }

        setClient(_client);
        setError(false);
      } catch (e) {
        console.error(e);

        if (!isMounted) {
          return;
        }

        setClient(undefined);
        setError(true);
      } finally {
        setIsLoadingClient(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [
    accountAddress,
    chain,
    entityId,
    isConnected,
    key,
    mode,
    signer,
    transport,
  ]);

  return { client, isLoadingClient, isError };
};
