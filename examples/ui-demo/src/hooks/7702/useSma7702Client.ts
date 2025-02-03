import { LocalAccountSigner } from "@aa-sdk/core";
import type { AlchemyWebSigner } from "@account-kit/signer";
import { useSigner, useSignerStatus } from "@account-kit/react";
import { useState, useEffect } from "react";
import {
  createSMA7702AccountClient,
  type InstallValidationActions,
  installValidationActions,
  SMA7702AccountClient,
} from "@account-kit/smart-contracts/experimental";
import { odyssey, splitOdysseyTransport } from "./transportSetup";
import {
  alchemyFeeEstimator,
  alchemyGasManagerMiddleware,
} from "@account-kit/infra";
import { type Hex, type Address, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";

type Client = SMA7702AccountClient<
  AlchemyWebSigner | LocalAccountSigner<PrivateKeyAccount>
> &
  InstallValidationActions<
    AlchemyWebSigner | LocalAccountSigner<PrivateKeyAccount>
  >;

export const useSma7702Client = (
  localKeyOverride?:
    | {
        readonly key: Hex;
        readonly entityId: number;
        readonly accountAddress?: Address;
      }
    | undefined
): {
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
          await createSMA7702AccountClient({
            chain: odyssey,
            transport: splitOdysseyTransport,
            accountAddress,
            signer:
              key != null
                ? new LocalAccountSigner(privateKeyToAccount(key))
                : signer,
            signerEntity:
              entityId != null
                ? {
                    isGlobalValidation: false,
                    entityId,
                  }
                : undefined,
            feeEstimator: alchemyFeeEstimator(splitOdysseyTransport),
            ...alchemyGasManagerMiddleware(
              process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID!
            ),
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
  }, [signer, key, entityId, accountAddress, isConnected]);

  return { client, isLoadingClient, isError };
};
