import {
  WalletClientSigner,
  type SignTypedDataParams,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import {
  FireblocksWeb3Provider,
  type FireblocksProviderConfig,
} from "@fireblocks/fireblocks-web3-provider";
import { createWalletClient, custom, type Hash } from "viem";
import { signerTypePrefix } from "../constants.js";
import type {
  FireblocksAuthenticationParams,
  FireblocksUserInfo,
} from "./types.js";

/**
 * This class requires the `@fireblocks/fireblocks-web3-provider` dependency.
 * `@alchemy/aa-signers` lists it as an optional dependency.
 *
 * @see: https://github.com/fireblocks/fireblocks-web3-provider
 */
export class FireblocksSigner
  implements
    SmartAccountAuthenticator<
      FireblocksAuthenticationParams,
      FireblocksUserInfo,
      FireblocksWeb3Provider
    >
{
  inner: FireblocksWeb3Provider;
  private signer: WalletClientSigner | undefined;

  constructor(
    params: FireblocksProviderConfig | { inner: FireblocksWeb3Provider }
  ) {
    if ("inner" in params) {
      this.inner = params.inner;
      return;
    }

    this.inner = new FireblocksWeb3Provider(params);
  }

  readonly signerType = `${signerTypePrefix}fireblocks`;

  getAddress = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    const address = await this.signer.getAddress();
    if (address == null) throw new Error("No address found");

    return address as Hash;
  };

  signMessage = async (msg: Uint8Array | string) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signMessage(msg);
  };

  signTypedData = (params: SignTypedDataParams) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signTypedData(params);
  };

  authenticate = async () => {
    if (this.inner == null) throw new Error("No provider found");

    this.signer = new WalletClientSigner(
      createWalletClient({
        transport: custom(this.inner),
      }),
      this.signerType
    );

    return { addresses: await this.inner.request({ method: "eth_accounts" }) };
  };

  getAuthDetails = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    return { addresses: await this.inner.request({ method: "eth_accounts" }) };
  };
}
