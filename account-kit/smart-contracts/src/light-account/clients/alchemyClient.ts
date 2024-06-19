import {
  AlchemyProviderConfigSchema,
  createAlchemyPublicRpcClient,
  createAlchemySmartAccountClientFromExisting,
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
} from "@account-kit/infra";
import {
  createLightAccount,
  lightAccountClientActions,
  type CreateLightAccountParams,
  type LightAccount,
  type LightAccountClientActions,
} from "@account-kit/smart-contracts";
import type { HttpTransport, SmartAccountSigner } from "@alchemy/aa-core";
import { custom, type Chain, type CustomTransport, type Transport } from "viem";

export type AlchemyLightAccountClientConfig<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateLightAccountParams<HttpTransport, TSigner>,
  "transport" | "chain"
> &
  Omit<
    AlchemySmartAccountClientConfig<Transport, Chain, LightAccount<TSigner>>,
    "account"
  >;

export async function createLightAccountAlchemyClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyLightAccountClientConfig<TSigner>
): Promise<
  AlchemySmartAccountClient<
    CustomTransport,
    Chain | undefined,
    LightAccount<TSigner>,
    LightAccountClientActions<TSigner>
  >
>;

/**
 * Creates an Alchemy smart account client connected to a Light Account instance.
 *
 * @example
 * ```ts
 * import { createLightAccountAlchemyClient } from "@account-kit/smart-contracts";
 * import { sepolia } from "@account-kit/infra/chains";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { generatePrivateKey } from "viem"
 * 
 * const lightAccountClient = await createLightAccountAlchemyClient({
 *  apiKey: "your-api-key",
 *  chain: sepolia,
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 *
 * @param {AlchemyLightAccountClientConfig} config The configuration for setting up the Alchemy Light Account Client
 * @returns {Promise<AlchemySmartAccountClient>} A promise that resolves to an `AlchemySmartAccountClient` object containing the created client
 */
export async function createLightAccountAlchemyClient(config: AlchemyLightAccountClientConfig): Promise<AlchemySmartAccountClient> {
  const { chain, opts, ...connectionConfig } =
    AlchemyProviderConfigSchema.parse(config);

  const client = createAlchemyPublicRpcClient({
    chain,
    connectionConfig,
  });

  const account = await createLightAccount({
    transport: custom(client),
    ...config,
  });

  return createAlchemySmartAccountClientFromExisting({
    ...config,
    client,
    account,
    opts,
  }).extend(lightAccountClientActions);
}
