import { type PrivateKeyAccount } from "viem";
import { LocalAccountSigner } from "./local-account";

/**
 * @deprecated use LocalAccountSigner instead
 */
export class PrivateKeySigner extends LocalAccountSigner<PrivateKeyAccount> {}
