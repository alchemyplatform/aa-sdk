import type { HDAccount } from "viem";
import { LocalAccountSigner } from "./local-account";

/**
 * @deprecated use LocalAccountSigner instead
 */
export class HdAccountSigner extends LocalAccountSigner<HDAccount> {}
