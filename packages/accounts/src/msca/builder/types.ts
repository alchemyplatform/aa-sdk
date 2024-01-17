import type { ISmartContractAccount } from "@alchemy/aa-core";
import type { Hex } from "viem";
import type { IMSCA } from "../types";

export type Executor = <A extends IMSCA<any, any, any>>(
  acct: A
) => Pick<ISmartContractAccount, "encodeExecute" | "encodeBatchExecute">;

export type SignerMethods = <A extends IMSCA<any, any, any>>(
  acct: A
) => Pick<
  ISmartContractAccount,
  | "signMessage"
  | "signTypedData"
  | "signUserOperationHash"
  | "getDummySignature"
>;

export type Factory = <A extends IMSCA<any, any, any>>(acct: A) => Promise<Hex>;
