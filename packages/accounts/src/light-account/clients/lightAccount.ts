import {
  createSmartAccountClient,
  type SmartAccountClient,
  type SmartAccountClientActions,
  type SmartAccountClientConfig,
  type SmartAccountSigner,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { type Chain, type CustomTransport, type Transport } from "viem";
import {
  createLightAccount,
  type CreateLightAccountParams,
  type LightAccount,
} from "../accounts/account.js";
import {
  lightAccountClientActions,
  type LightAccountClientActions,
} from "../decorators/lightAccount.js";

export type CreateLightAccountClientParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  transport: CreateLightAccountParams<TTransport, TSigner>["transport"];
  chain: CreateLightAccountParams<TTransport, TSigner>["chain"];
  account: Omit<
    CreateLightAccountParams<TTransport, TSigner>,
    "transport" | "chain"
  >;
} & Omit<
  SmartAccountClientConfig<TTransport, TChain>,
  "transport" | "account" | "chain"
>;

export function createLightAccountClient<
  TChain extends Chain | undefined = Chain | undefined,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  args: CreateLightAccountClientParams<Transport, TChain, TSigner>
): Promise<
  SmartAccountClient<
    CustomTransport,
    Chain,
    LightAccount<TSigner>,
    SmartAccountClientActions<Chain, SmartContractAccount> &
      LightAccountClientActions<TSigner, LightAccount<TSigner>>
  >
>;

export async function createLightAccountClient({
  account,
  transport,
  chain,
  ...clientConfig
}: CreateLightAccountClientParams): Promise<SmartAccountClient> {
  const lightAccount = await createLightAccount({
    ...account,
    transport,
    chain,
  });

  return createSmartAccountClient({
    ...clientConfig,
    transport,
    chain: chain,
    account: lightAccount,
  }).extend(lightAccountClientActions);
}
