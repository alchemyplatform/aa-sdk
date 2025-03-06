import { type SmartAccountSigner } from "@aa-sdk/core";
import {
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
  type AlchemyTransport,
} from "@account-kit/infra";
import {
  createMultisigModularAccountClient,
  type AccountLoupeActions,
  type CreateMultisigModularAccountParams,
  type LightAccount,
  type MultisigModularAccount,
  type MultisigPluginActions,
  type MultisigUserOperationContext,
  type PluginManagerActions,
} from "@account-kit/smart-contracts";
import { type Chain, type HttpTransport } from "viem";

// todo: this file seems somewhat duplicated with ./modularAccountClient.ts, but that file has some multi-owner specific fields. Is there a way to refactor these two to de-dupe?

export type AlchemyMultisigAccountClientConfig<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultisigModularAccountParams<HttpTransport, TSigner>,
  "transport"
> &
  Omit<
    AlchemySmartAccountClientConfig<
      Chain,
      LightAccount<TSigner>,
      MultisigUserOperationContext
    >,
    "account"
  > & { transport: AlchemyTransport };

export function createMultisigAccountAlchemyClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyMultisigAccountClientConfig<TSigner>
): Promise<
  AlchemySmartAccountClient<
    Chain | undefined,
    MultisigModularAccount<TSigner>,
    MultisigPluginActions<MultisigModularAccount<TSigner>> &
      PluginManagerActions<MultisigModularAccount<TSigner>> &
      AccountLoupeActions<MultisigModularAccount<TSigner>>,
    MultisigUserOperationContext
  >
>;

/**
 * Creates an Alchemy client for a multisig account using the provided configuration.
 *
 * @example
 * ```ts
 * import { createMultisigAccountAlchemyClient } from "@account-kit/smart-contracts";
 * import { sepolia } from "@account-kit/infra";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { generatePrivateKey } from "viem"
 *
 * const alchemyAccountClient = await createMultisigAccountAlchemyClient({
 *  transport: alchemy({ apiKey: "your-api-key" }),
 *  chain: sepolia,
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
 *  owners: [...], // other owners on the account
 *  threshold: 2, // 2 of N signatures
 * });
 * ```
 *
 * @deprecated Use createModularAccountClient instead of this function, we are switching based on the transport
 * @param {AlchemyMultisigAccountClientConfig} config The configuration for the Alchemy multisig account client
 * @returns {Promise<AlchemySmartAccountClient<Transport, Chain | undefined, MultisigModularAccount<SmartAccountSigner>, MultisigPluginActions<MultisigModularAccount<SmartAccountSigner>> & PluginManagerActions<MultisigModularAccount<SmartAccountSigner>> & AccountLoupeActions<MultisigModularAccount<SmartAccountSigner>>, MultisigUserOperationContext>>} A promise that resolves to an Alchemy Smart Account Client for multisig accounts with extended functionalities.
 */
export async function createMultisigAccountAlchemyClient(
  config: AlchemyMultisigAccountClientConfig
): Promise<
  AlchemySmartAccountClient<
    Chain | undefined,
    MultisigModularAccount<SmartAccountSigner>,
    MultisigPluginActions<MultisigModularAccount<SmartAccountSigner>> &
      PluginManagerActions<MultisigModularAccount<SmartAccountSigner>> &
      AccountLoupeActions<MultisigModularAccount<SmartAccountSigner>>,
    MultisigUserOperationContext
  >
> {
  return createMultisigModularAccountClient(config);
}
