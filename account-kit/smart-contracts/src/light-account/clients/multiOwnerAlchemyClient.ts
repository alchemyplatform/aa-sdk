import {
  AlchemyProviderConfigSchema,
  createAlchemyPublicRpcClient,
  createAlchemySmartAccountClientFromExisting,
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
} from "@account-kit/infra";
import {
  createMultiOwnerLightAccount,
  multiOwnerLightAccountClientActions,
  type CreateMultiOwnerLightAccountParams,
  type MultiOwnerLightAccount,
  type MultiOwnerLightAccountClientActions,
} from "@account-kit/smart-contracts";
import type { HttpTransport, SmartAccountSigner } from "@aa-sdk/core";
import { custom, type Chain, type CustomTransport, type Transport } from "viem";

export type AlchemyMultiOwnerLightAccountClientConfig<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultiOwnerLightAccountParams<HttpTransport, TSigner>,
  "transport" | "chain"
> &
  Omit<
    AlchemySmartAccountClientConfig<
      Transport,
      Chain,
      MultiOwnerLightAccount<TSigner>
    >,
    "account"
  >;

export async function createMultiOwnerLightAccountAlchemyClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyMultiOwnerLightAccountClientConfig<TSigner>
): Promise<
  AlchemySmartAccountClient<
    CustomTransport,
    Chain | undefined,
    MultiOwnerLightAccount<TSigner>,
    MultiOwnerLightAccountClientActions<TSigner>
  >
>;

/**
 * Creates a multi-owner light account Alchemy client using the provided configuration.
 *
 * @example
 * ```ts
 * import { createMultiOwnerLightAccountAlchemyClient } from "@account-kit/smart-contracts";
 * import { sepolia } from "@account-kit/infra/chains";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { generatePrivateKey } from "viem"
 *
 * const lightAccountClient = await createMultiOwnerLightAccountAlchemyClient({
 *  apiKey: "your-api-key",
 *  chain: sepolia,
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 *
 * @param {AlchemyMultiOwnerLightAccountClientConfig} config The configuration for creating the Alchemy client
 * @returns {Promise<AlchemySmartAccountClient>} A promise that resolves to an `AlchemySmartAccountClient` object containing the created account information and methods
 */
export async function createMultiOwnerLightAccountAlchemyClient(
  config: AlchemyMultiOwnerLightAccountClientConfig
): Promise<AlchemySmartAccountClient> {
  const { chain, opts, ...connectionConfig } =
    AlchemyProviderConfigSchema.parse(config);

  const client = createAlchemyPublicRpcClient({
    chain,
    connectionConfig,
  });

  const account = await createMultiOwnerLightAccount({
    transport: custom(client),
    ...config,
  });

  return createAlchemySmartAccountClientFromExisting({
    ...config,
    client,
    account,
    opts,
  }).extend(multiOwnerLightAccountClientActions);
}
