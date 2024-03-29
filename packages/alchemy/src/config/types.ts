import type {
  LightAccount,
  MultiOwnerModularAccount,
} from "@alchemy/aa-accounts";
import type { ConnectionConfig } from "@alchemy/aa-core";
import type { Chain } from "viem";
import type { PartialBy } from "viem/chains";
import type { ClientWithAlchemyMethods } from "../client/types";
import type {
  AlchemySigner,
  AlchemySignerClient,
  AlchemySignerParams,
} from "../signer";
import type { ClientStore, CoreStore } from "./store/types";

export type SupportedAccountTypes = "LightAccount" | "MultiOwnerModularAccount";

export type SupportedAccounts =
  | LightAccount<AlchemySigner>
  | MultiOwnerModularAccount<AlchemySigner>;

export type SupportedAccount<T extends SupportedAccountTypes> =
  T extends "LightAccount"
    ? LightAccount<AlchemySigner>
    : T extends "MultiOwnerModularAccount"
    ? MultiOwnerModularAccount<AlchemySigner>
    : never;

export type AlchemyAccountsConfig = {
  bundlerClient: ClientWithAlchemyMethods;
  signer: AlchemySigner;
  coreStore: CoreStore;
  clientStore: ClientStore;
};

export type CreateConfigProps = ConnectionConfig & {
  chain: Chain;
  sessionConfig?: AlchemySignerParams["sessionConfig"];
  signerConnection?: ConnectionConfig;
} & Omit<
    PartialBy<
      Exclude<AlchemySignerParams["client"], AlchemySignerClient>,
      "iframeConfig"
    >,
    "connection"
  >;
