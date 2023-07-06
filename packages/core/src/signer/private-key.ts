import { type PrivateKeyAccount } from "viem";
import { LocalAccountSigner } from "./local-account.js";

/**
 * @deprecated use LocalAccountSigner instead
 */
export class PrivateKeySigner extends LocalAccountSigner<PrivateKeyAccount> {}
