import type { HttpTransport, SmartAccountSigner } from "@aa-sdk/core";
import {
  createAlchemySmartAccountClient,
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
import { type Chain } from "viem";

export type AlchemyLightAccountClientConfig<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<CreateLightAccountParams<HttpTransport, TSigner>, "transport"> &
  Omit<
    AlchemySmartAccountClientConfig<Chain, LightAccount<TSigner>>,
    "account"
  >;

export async function createLightAccountAlchemyClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyLightAccountClientConfig<TSigner>
): Promise<
  AlchemySmartAccountClient<
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
 * import { sepolia, alchemy } from "@account-kit/infra";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { generatePrivateKey } from "viem"
 *
 * const lightAccountClient = await createLightAccountAlchemyClient({
 *  transport: alchemy({ apiKey: "your-api-key" }),
 *  chain: sepolia,
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 *
 * @param {AlchemyLightAccountClientConfig} config The configuration for setting up the Alchemy Light Account Client
 * @returns {Promise<AlchemySmartAccountClient>} A promise that resolves to an `AlchemySmartAccountClient` object containing the created client
 */
export async function createLightAccountAlchemyClient({
  opts,
  transport,
  chain,
  ...config
}: AlchemyLightAccountClientConfig): Promise<AlchemySmartAccountClient> {
  const account = await createLightAccount({
    ...config,
    transport,
    chain,
  });

  return createAlchemySmartAccountClient({
    ...config,
    transport,
    chain,
    account,
    opts,
  }).extend(lightAccountClientActions);
}
