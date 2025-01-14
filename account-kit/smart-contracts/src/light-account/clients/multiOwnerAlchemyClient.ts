import type { HttpTransport, SmartAccountSigner } from "@aa-sdk/core";
import {
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
} from "@account-kit/infra";
import {
  createMultiOwnerLightAccountClient,
  type CreateMultiOwnerLightAccountParams,
  type MultiOwnerLightAccount,
  type MultiOwnerLightAccountClientActions,
} from "@account-kit/smart-contracts";
import { type Chain } from "viem";

export type AlchemyMultiOwnerLightAccountClientConfig<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultiOwnerLightAccountParams<HttpTransport, TSigner>,
  "transport" | "type"
> &
  Omit<
    AlchemySmartAccountClientConfig<Chain, MultiOwnerLightAccount<TSigner>>,
    "account"
  >;

export async function createMultiOwnerLightAccountAlchemyClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyMultiOwnerLightAccountClientConfig<TSigner>
): Promise<
  AlchemySmartAccountClient<
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
 * import { sepolia, alchemy } from "@account-kit/infra";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { generatePrivateKey } from "viem"
 *
 * const lightAccountClient = await createMultiOwnerLightAccountAlchemyClient({
 *  transport: alchemy({
 *    apiKey: "your-api-key",
 *  }),
 *  chain: sepolia
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 *
 * @deprecated Use createMultiOwnerLightAccountAlchemyClient instead now, it should switch depending on the transport
 * @param {AlchemyMultiOwnerLightAccountClientConfig} config The configuration for creating the Alchemy client
 * @returns {Promise<AlchemySmartAccountClient>} A promise that resolves to an `AlchemySmartAccountClient` object containing the created account information and methods
 */
export async function createMultiOwnerLightAccountAlchemyClient({
  opts,
  transport,
  chain,
  ...config
}: AlchemyMultiOwnerLightAccountClientConfig): Promise<AlchemySmartAccountClient> {
  return createMultiOwnerLightAccountClient({
    opts,
    transport,
    chain,
    ...config,
  });
}
