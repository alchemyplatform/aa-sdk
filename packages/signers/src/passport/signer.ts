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

  constructor(params: PassportClientParams | { inner: Passport }) {
    if ("inner" in params) {
      this.inner = params.inner;
    } else {
      this.inner = new Passport(params);
    }
  }

  readonly signerType = `${signerTypePrefix}passport`;

  getAddress = async () => {
    if (!this.inner || !this.signer) {
      throw new Error("Not authenticated");
    }

    return this.signer.getAddress();
  };

  signMessage = async (msg: SignableMessage) => {
    if (!this.inner || !this.signer) {
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
    if (!this.inner || !this.signer) {
      throw new Error("Not authenticated");
    }

    return this.signer.signTypedData(params);
  };

  authenticate = async (params: PassportAuthenticationParams) => {
    if (this.inner == null) throw new Error("No provider found");

    await this.inner.setupEncryption();
    const [authenticatedHeaders, address] = await this.inner.authenticate({
      username: params.username,
      userDisplayName: params.userDisplayName,
    });

    const fallbackProvider = http(params.fallbackProvider);

    const client: WalletClient = params.endpoint
      ? createPassportClient(
          authenticatedHeaders,
          fallbackProvider,
          params.chain,
          params.endpoint
        )
      : createPassportClient(
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
  };

  getAuthDetails = async () => {
    if (!this.inner || !this.signer || !this.authDetails) {
      throw new Error("Not authenticated");
    }

    return this.authDetails;
  };
}
