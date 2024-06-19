import {
  AlchemyProviderConfigSchema,
  createAlchemyPublicRpcClient,
  createAlchemySmartAccountClientFromExisting,
  type AlchemySmartAccountClient,
  type AlchemySmartAccountClientConfig,
} from "@account-kit/infra";
import {
  accountLoupeActions,
  createMultisigModularAccount,
  multisigPluginActions,
  multisigSignatureMiddleware,
  pluginManagerActions,
  type AccountLoupeActions,
  type CreateMultisigModularAccountParams,
  type LightAccount,
  type MultisigModularAccount,
  type MultisigPluginActions,
  type MultisigUserOperationContext,
  type PluginManagerActions,
} from "@account-kit/smart-contracts";
import {
  smartAccountClientActions,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import {
  custom,
  type Chain,
  type CustomTransport,
  type HttpTransport,
  type Transport,
} from "viem";

// todo: this file seems somewhat duplicated with ./modularAccountClient.ts, but that file has some multi-owner specific fields. Is there a way to refactor these two to de-dupe?

export type AlchemyMultisigAccountClientConfig<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  CreateMultisigModularAccountParams<HttpTransport, TSigner>,
  "transport" | "chain"
> &
  Omit<
    AlchemySmartAccountClientConfig<
      Transport,
      Chain,
      LightAccount<TSigner>,
      MultisigUserOperationContext
    >,
    "account"
  >;

export function createMultisigAccountAlchemyClient<
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: AlchemyMultisigAccountClientConfig<TSigner>
): Promise<
  AlchemySmartAccountClient<
    CustomTransport,
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
 * import { sepolia } from "@account-kit/infra/chains";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { generatePrivateKey } from "viem"
 * 
 * const alchemyAccountClient = await createMultisigAccountAlchemyClient({
 *  apiKey: "your-api-key",
 *  chain: sepolia,
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
 *  owners: [...], // other owners on the account
 *  threshold: 2, // 2 of N signatures
 * });
 * ```
 * 
 * @param {AlchemyMultisigAccountClientConfig} config The configuration for the Alchemy multisig account client
 * @returns {Promise<AlchemySmartAccountClient<Transport, Chain | undefined, MultisigModularAccount<SmartAccountSigner>, MultisigPluginActions<MultisigModularAccount<SmartAccountSigner>> & PluginManagerActions<MultisigModularAccount<SmartAccountSigner>> & AccountLoupeActions<MultisigModularAccount<SmartAccountSigner>>, MultisigUserOperationContext>>} A promise that resolves to an Alchemy Smart Account Client for multisig accounts with extended functionalities.
 */
export async function createMultisigAccountAlchemyClient(config: AlchemyMultisigAccountClientConfig): Promise<
  AlchemySmartAccountClient<
    Transport,
    Chain | undefined,
    MultisigModularAccount<SmartAccountSigner>,
    MultisigPluginActions<MultisigModularAccount<SmartAccountSigner>> &
      PluginManagerActions<MultisigModularAccount<SmartAccountSigner>> &
      AccountLoupeActions<MultisigModularAccount<SmartAccountSigner>>,
    MultisigUserOperationContext
  >
> {
  const { chain, opts, ...connectionConfig } =
    AlchemyProviderConfigSchema.parse(config);

  const client = createAlchemyPublicRpcClient({
    chain,
    connectionConfig,
  });

  const account = await createMultisigModularAccount({
    transport: custom(client),
    ...config,
  });

  return createAlchemySmartAccountClientFromExisting<
    Chain | undefined,
    MultisigModularAccount<SmartAccountSigner>,
    MultisigUserOperationContext
  >({
    ...config,
    client,
    account,
    opts,
    signUserOperation: multisigSignatureMiddleware,
  })
    .extend(smartAccountClientActions)
    .extend(multisigPluginActions)
    .extend(pluginManagerActions)
    .extend(accountLoupeActions);
}
