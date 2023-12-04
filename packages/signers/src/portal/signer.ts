import {
  WalletClientSigner,
  type SignTypedDataParams,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import Portal, { type PortalOptions } from "@portal-hq/web";
import { createWalletClient, custom, type Hash } from "viem";
import type { PortalAuthenticationParams, PortalUserInfo } from "./types.js";

/**
 * This class requires the `@portal-hq/web` dependency.
 * `@alchemy/aa-signers` lists it as an optional dependency.
 *
 * @see: https://docs.portalhq.io/sdk/web-beta
 */
export class PortalSigner
  implements
    SmartAccountAuthenticator<
      PortalAuthenticationParams,
      PortalUserInfo,
      Portal
    >
{
  inner: Portal;
  private signer: WalletClientSigner | undefined;

  constructor(params: PortalOptions | { inner: Portal }) {
    if ("inner" in params) {
      this.inner = params.inner;
      return;
    }

    this.inner = new Portal(params);
  }

  readonly signerType = "portal";

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
        transport: custom(this.inner.provider),
      }),
      this.signerType
    );

    return this.inner.getClient() as Promise<PortalUserInfo>;
  };

  getAuthDetails = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.inner.getClient() as Promise<PortalUserInfo>;
  };
}
