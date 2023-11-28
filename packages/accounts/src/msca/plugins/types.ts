import type {
  ISmartAccountProvider,
  ISmartContractAccount,
  SupportedTransports,
} from "@alchemy/aa-core";
import type { MSCA } from "../builder";

export interface Plugin<AD, PD> {
  meta: { name: string; version: string };
  accountDecorators: (a: ISmartContractAccount) => AD;
  providerDecorators: <
    TTransport extends SupportedTransports,
    P extends ISmartAccountProvider<TTransport> & { account: MSCA<TTransport> }
  >(
    p: P
  ) => PD;
}
