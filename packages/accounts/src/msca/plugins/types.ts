import type { BaseSmartContractAccount } from "@alchemy/aa-core";

export interface Plugin<D> {
  meta: { name: string; version: string };
  accountDecorators: (a: BaseSmartContractAccount) => D;
}
