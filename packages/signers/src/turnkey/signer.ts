import {
  WalletClientSigner,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import { TurnkeyClient } from "@turnkey/http";
import { createAccount } from "@turnkey/viem";
import {
  createWalletClient,
  type LocalAccount,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { signerTypePrefix } from "../constants.js";
import type {
  TurnkeyAuthParams,
  TurnkeyClientParams,
  TurnkeySubOrganization,
  TurnkeyUserMetadata,
} from "./types.js";

/**
 * This class requires the `@turnkey/http` and `@turnkey/viem` dependencies.
 * `@alchemy/aa-signers` lists them as optional dependencies.
 *
 * @see https://github.com/tkhq/sdk/tree/main/packages/http
 * @see https://github.com/tkhq/sdk/tree/main/packages/viem
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

  readonly signerType = `${signerTypePrefix}turnkey`;

  getAddress = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.getAddress();
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

  authenticate = async (params: TurnkeyAuthParams) => {
    this.subOrganization = await params.resolveSubOrganization();
    this.signer = new WalletClientSigner(
      createWalletClient({
        account: (await createAccount({
          client: this.inner,
          organizationId: this.subOrganization.subOrganizationId,
          signWith: this.subOrganization.signWith,
        })) as LocalAccount,
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
