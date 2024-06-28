import {
  WalletClientSigner,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import { signerTypePrefix } from "../constants.js";
import type {
  PassportAuthenticationParams,
  PassportClientParams,
  PassportUserInfo,
} from "./types";
import { Passport } from "@0xpass/passport";
import { createPassportClient } from "@0xpass/passport-viem-alchemy";
import { http } from "viem";
import type { TypedDataDefinition, WalletClient, SignableMessage } from "viem";

/**
 * PassportSigner is a signer implementation which extends `SmartAccountAuthenticator` to leverage the `Passport Network`
 */
export class PassportSigner
  implements
    SmartAccountAuthenticator<
      PassportAuthenticationParams,
      PassportUserInfo,
      Passport
    >
{
  inner: Passport;
  private signer: WalletClientSigner | undefined;
  private authDetails: PassportUserInfo | undefined;
  private enableSession: boolean;

  /**
   * Constructs a new PassportSigner instance.
   *
   * @param params - The PassportClientParams or an instance of Passport.
   * @returns A new PassportSigner instance.
   */
  constructor(
    params: PassportClientParams | { inner: Passport; enableSession?: boolean }
  ) {
    if ("inner" in params) {
      this.inner = params.inner;
      this.enableSession = params.enableSession ?? true;
    } else {
      this.inner = new Passport(params);
      this.enableSession = params.enableSession ?? true;
    }
  }

  readonly signerType = `${signerTypePrefix}passport`;

  getAddress = async () => {
    if ((this.enableSession && !this.inner) || !this.signer) {
      throw new Error("Not authenticated");
    }

    return this.signer.getAddress();
  };

  signMessage = async (msg: SignableMessage) => {
    if ((this.enableSession && !this.inner) || !this.signer) {
      throw new Error("Not authenticated");
    }

    return this.signer.signMessage(msg);
  };

  signTypedData = async <
    const TTypedData extends Record<string, unknown>,
    TPrimaryType extends string = string
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ) => {
    if ((this.enableSession && !this.inner) || !this.signer) {
      throw new Error("Not authenticated");
    }

    return this.signer.signTypedData(params);
  };

  authenticate = async (params: PassportAuthenticationParams) => {
    const fallbackProvider = http(params.fallbackProvider);

    if ((this.enableSession && !this.inner) || !this.signer) {
      // For now this flow is specific to the `WebAuthnSigner` flow, so we will require a user display name

      if (!params.userDisplayName) {
        throw new Error("User display name is required");
      }

      await this.inner.setupEncryption();
      const [authenticatedHeaders, address] = await this.inner.authenticate({
        username: params.username,
        userDisplayName: params.userDisplayName,
      });

      const client: WalletClient = params.network
        ? await createPassportClient(
            authenticatedHeaders,
            fallbackProvider,
            params.chain,
            params.network
          )
        : await createPassportClient(
            authenticatedHeaders,
            fallbackProvider,
            params.chain
          );

      this.signer = new WalletClientSigner(client, this.signerType);

      this.authDetails = {
        authenticatedHeaders: authenticatedHeaders,
        addresses: [address as `0x${string}`],
      };

      return this.authDetails;
    } else {
      // If sessions are not enabled, we will follow the `KeySigner` flow
      await this.inner.setupEncryption();

      // Username here can be alias for any identifier that is unique to the user
      this.inner.setUserData({ username: params.username });
      const delegatedAuthHeaders =
        await this.inner.getDelegatedAuthenticatedHeaders();

      const client = params.network
        ? await createPassportClient(
            delegatedAuthHeaders,
            fallbackProvider,
            params.chain,
            params.network
          )
        : await createPassportClient(
            delegatedAuthHeaders,
            fallbackProvider,
            params.chain
          );

      this.authDetails = {
        authenticatedHeaders: delegatedAuthHeaders,
        addresses: [await this.signer.getAddress()],
      };

      return (this.signer = new WalletClientSigner(client, this.signerType));
    }
  };

  getAuthDetails = async () => {
    if ((this.enableSession && !this.inner) || !this.signer) {
      throw new Error("Not authenticated");
    }

    return this.authDetails;
  };
}
