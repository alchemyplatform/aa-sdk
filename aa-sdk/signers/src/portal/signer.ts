import {
  WalletClientSigner,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import Portal, { type PortalOptions } from "@portal-hq/web";
import {
  createWalletClient,
  custom,
  type Hash,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { signerTypePrefix } from "../constants.js";
import type { PortalAuthenticationParams, PortalUserInfo } from "./types.js";

/**
 * This class requires the `@portal-hq/web` dependency.
 * `@alchemy/aa-signers` lists it as an optional dependency.
 *
 * @see https://docs.portalhq.io/sdk/web-beta
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

  readonly signerType = `${signerTypePrefix}portal`;

  getAddress = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    const address = await this.signer.getAddress();
    if (address == null) throw new Error("No address found");

    return address as Hash;
  };

  signMessage = async (msg: SignableMessage) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signMessage(msg);
  };

  signTypedData = async <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signTypedData(params);
  };

  authenticate = async () => {
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
