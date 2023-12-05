import {
  WalletClientSigner,
  type SignTypedDataParams,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import { TurnkeyClient } from "@turnkey/http";
import { createAccount } from "@turnkey/viem";
import { createWalletClient } from "viem";
import type {
  TurnkeyUserMetadata,
  TurnkeyAuthParams,
  TurnkeyClientParams,
  TurnkeySubOrganization,
} from "./types.js";

/**
 * This class requires the `@turnkey/http` and `@turnkey/viem` dependencies.
 * `@alchemy/aa-signers` lists them as optional dependencies.
 *
 * @see: https://github.com/tkhq/sdk/tree/main/packages/http
 * @see: https://github.com/tkhq/sdk/tree/main/packages/viem
 */
export class TurnkeySigner
  implements
    SmartAccountAuthenticator<
      TurnkeyAuthParams,
      TurnkeyUserMetadata,
      TurnkeyClient
    >
{
  inner: TurnkeyClient;
  private signer: WalletClientSigner | undefined;
  private subOrganization: TurnkeySubOrganization | undefined;

  constructor(params: TurnkeyClientParams | { inner: TurnkeyClient }) {
    if ("inner" in params) {
      this.inner = params.inner;
      return;
    }

    this.inner = new TurnkeyClient({ baseUrl: params.apiUrl }, params.stamper);
  }

  readonly signerType = "turnkey";

  getAddress = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.getAddress();
  };

  signMessage = async (msg: Uint8Array | string) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signMessage(msg);
  };

  signTypedData = (params: SignTypedDataParams) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signTypedData(params);
  };

  authenticate = async (params: TurnkeyAuthParams) => {
    this.subOrganization = await params.resolveSubOrganization();
    this.signer = new WalletClientSigner(
      createWalletClient({
        account: await createAccount({
          client: this.inner,
          organizationId: this.subOrganization.subOrganizationId,
          signWith: this.subOrganization.signWith,
        }),
        transport: params.transport,
      }),
      this.signerType
    );

    return this.inner.getWhoami({
      organizationId: this.subOrganization.subOrganizationId,
    });
  };

  getAuthDetails = async () => {
    if (!this.signer || !this.subOrganization)
      throw new Error("Not authenticated");

    return this.inner.getWhoami({
      organizationId: this.subOrganization.subOrganizationId,
    });
  };
}
