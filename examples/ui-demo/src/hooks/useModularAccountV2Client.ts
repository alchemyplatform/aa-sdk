import type { AlchemySigner } from "@account-kit/core";
import { useSigner, useSignerStatus } from "@account-kit/react";
import { useState, useEffect } from "react";
import {
  createModularAccountV2Client,
  ModularAccountV2Client,
} from "@account-kit/smart-contracts";
import { alchemyFeeEstimator, AlchemyTransport } from "@account-kit/infra";
import { Chain, Hex, Address, PrivateKeyAccount } from "viem";
import { LocalAccountSigner } from "@aa-sdk/core";
import { privateKeyToAccount } from "viem/accounts";

type Client = ModularAccountV2Client<
  AlchemySigner | LocalAccountSigner<PrivateKeyAccount>
>;

interface PolicyToken {
  address: Address;
  maxTokenAmount: bigint;
  permit?: {
    paymasterAddress?: Address;
    autoPermitApproveTo: bigint;
    autoPermitBelow: bigint;
    erc20Name: string;
    version: string;
  };
}

// Hook that creates an MAv2 client that can be used for things that
// @account-kit/react doesn't yet support, such as session keys.
export const useModularAccountV2Client = ({
  mode,
  chain,
  transport,
  localKeyOverride,
  policyId: policyIdProp,
  policyToken: policyTokenProp,
}: {
  mode: "7702" | "default";
  chain: Chain;
  transport: AlchemyTransport;
  localKeyOverride?: {
    readonly privateKey: Hex;
    readonly entityId: number;
    readonly isGlobalValidation: boolean;
    readonly accountAddress?: Address;
  };
  policyId?: string;
  policyToken?: PolicyToken;
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
  const { privateKey, entityId, accountAddress, isGlobalValidation } =
    localKeyOverride ?? {};

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!signer || !isConnected || client) {
        return;
      }

      if (privateKey != null && accountAddress == null) {
        // We have an override present but don't have the account to set it for, so leave the client as undefined until we get the account address override.
        return;
      }

      try {
        const _client: Client = await createModularAccountV2Client({
          mode,
          chain,
          transport,
          signer: privateKey
            ? new LocalAccountSigner(privateKeyToAccount(privateKey))
            : signer,
          signerEntity:
            entityId && isGlobalValidation != null
              ? {
                  isGlobalValidation,
                  entityId,
                }
              : undefined,
          accountAddress,
          feeEstimator: alchemyFeeEstimator(transport),
          policyId:
            policyIdProp ?? process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID!,
          policyToken: policyTokenProp,
        });

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
    client,
    entityId,
    isConnected,
    isGlobalValidation,
    localKeyOverride,
    mode,
    policyIdProp,
    policyTokenProp,
    privateKey,
    signer,
    transport,
  ]);

  return { client, isLoadingClient, isError };
};
