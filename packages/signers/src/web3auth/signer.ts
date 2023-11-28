import {
  WalletClientSigner,
  type SignTypedDataParams,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import { Web3Auth, type Web3AuthOptions } from "@web3auth/modal";
import { createWalletClient, custom, type Hash } from "viem";
import type {
  Web3AuthAuthenticationParams,
  Web3AuthUserInfo,
} from "./types.js";

/**
 * This class requires the `@web3auth/modal` and `@web3auth/base dependencies.
 * `@alchemy/aa-signers` lists them as optional dependencies.
 *
 * @see: https://github.com/Web3Auth/web3auth-web/tree/master/packages/modal
 * @see: https://github.com/Web3Auth/web3auth-web/tree/master/packages/base
 */
export class Web3AuthSigner
  implements
    SmartAccountAuthenticator<
      Web3AuthAuthenticationParams,
      Web3AuthUserInfo,
      Web3Auth
    >
{
  inner: Web3Auth;
  private signer: WalletClientSigner | undefined;

  constructor(params: Web3AuthOptions | { inner: Web3Auth }) {
    if ("inner" in params) {
      this.inner = params.inner;
      return;
    }

    this.inner = new Web3Auth(params);
  }

  readonly signerType = "web3auth";

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

  authenticate = async (
    params: Web3AuthAuthenticationParams = {
      init: async () => {
        await this.inner.initModal();
      },
      connect: async () => {
        await this.inner.connect();
      },
    }
  ) => {
    await params.init();
    await params.connect();

    if (this.inner.provider == null) throw new Error("No provider found");

    this.signer = new WalletClientSigner(
      createWalletClient({
        transport: custom(this.inner.provider),
      }),
      this.signerType
    );

    return this.inner.getUserInfo();
  };

  getAuthDetails = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.inner.getUserInfo();
  };
}
