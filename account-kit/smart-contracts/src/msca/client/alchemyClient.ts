import type { SmartAccountSigner } from "@aa-sdk/core";
import {
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
} from "@account-kit/infra";
import {
  createMultiOwnerModularAccountClient,
  type AccountLoupeActions,
  type CreateMultiOwnerModularAccountParams,
  type LightAccount,
  type MultiOwnerModularAccount,
  type MultiOwnerPluginActions,
  type PluginManagerActions,
} from "@account-kit/smart-contracts";
import { type Chain, type HttpTransport } from "viem";

export type AlchemyModularAccountClientConfig<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = Omit<
  CreateMultiOwnerModularAccountParams<HttpTransport, TSigner>,
  "transport"
> &
  Omit<
    AlchemySmartAccountClientConfig<Chain, LightAccount<TSigner>>,
    "account"
  >;

export function createModularAccountAlchemyClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
>(
  params: AlchemyModularAccountClientConfig<TSigner>,
): Promise<
  AlchemySmartAccountClient<
    Chain | undefined,
    MultiOwnerModularAccount<TSigner>,
    MultiOwnerPluginActions<MultiOwnerModularAccount<TSigner>> &
      PluginManagerActions<MultiOwnerModularAccount<TSigner>> &
      AccountLoupeActions<MultiOwnerModularAccount<TSigner>>
  >
>;

/**
 * Creates a modular account Alchemy client with the provided configuration.
 *
 * @example
 * ```ts
 * import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";
 * import { sepolia, alchemy } from "@account-kit/infra";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { generatePrivateKey } from "viem"
 *
 * const alchemyAccountClient = await createModularAccountAlchemyClient({
 *  transport: alchemy({ apiKey: "your-api-key" }),
 *  chain: sepolia,
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 * @deprecated Use createModularAccountClient instead of this function, we are switching based on the transport
 * @param {AlchemyModularAccountClientConfig} config The configuration for creating the Alchemy client
 * @returns {Promise<AlchemySmartAccountClient>} A promise that resolves to an `AlchemySmartAccountClient` configured with the desired plugins and actions
 */
export async function createModularAccountAlchemyClient(
  config: AlchemyModularAccountClientConfig,
): Promise<AlchemySmartAccountClient> {
  return createMultiOwnerModularAccountClient(config);
}
