import type { HDAccount } from "viem";
import { LocalAccountSigner } from "./local-account.js";

/**
 * @deprecated use LocalAccountSigner instead
 */
export class HdAccountSigner extends LocalAccountSigner<HDAccount> {}
