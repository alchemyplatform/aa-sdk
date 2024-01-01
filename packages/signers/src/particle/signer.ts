import {
  WalletClientSigner,
  type SignTypedDataParams,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import {
  ParticleNetwork,
  type Config,
  type LoginOptions,
} from "@particle-network/auth";
import { ParticleProvider } from "@particle-network/provider";
import { createWalletClient, custom, type Hash } from "viem";
import { signerTypePrefix } from "../constants.js";
import type {
  ParticleAuthenticationParams,
  ParticleUserInfo,
} from "./types.js";

/**
 * This class requires the `@particle-network/auth` and `@particle-network/provider` dependencies.
 * `@alchemy/aa-signers` lists thems as an optional dependencies.
 *
 * @see: https://docs.particle.network/developers/auth-service/sdks/web
 */
export class ParticleSigner
  implements
    SmartAccountAuthenticator<
      ParticleAuthenticationParams,
      ParticleUserInfo,
      ParticleNetwork
    >
{
  inner: ParticleNetwork;
  private provider: ParticleProvider;
  private signer: WalletClientSigner | undefined;

  constructor(
    params: Config | { inner: ParticleNetwork; provider?: ParticleProvider }
  ) {
    if ("inner" in params) {
      this.inner = params.inner;
      this.provider =
        params.provider != null
          ? params.provider
          : new ParticleProvider(this.inner.auth);

      if (this.inner.auth.isLogin()) {
        this.signer = new WalletClientSigner(
          createWalletClient({
            transport: custom(this.provider),
          }),
          this.signerType
        );
      }

      return;
    }

    this.inner = new ParticleNetwork(params);
    this.provider = new ParticleProvider(this.inner.auth);

    if (this.inner.auth.isLogin()) {
      this.signer = new WalletClientSigner(
        createWalletClient({
          transport: custom(this.provider),
        }),
        this.signerType
      );
    }
  }

  readonly signerType = `${signerTypePrefix}particle`;

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
    params: ParticleAuthenticationParams = {
      loginOptions: {},
      login: async (loginOptions: LoginOptions) => {
        this.inner.auth.login(loginOptions);
      },
    }
  ) => {
    if (this.inner == null) throw new Error("No provider found");

    await params.login(params.loginOptions);

    this.signer = new WalletClientSigner(
      createWalletClient({
        transport: custom(this.provider),
      }),
      this.signerType
    );

    const userInfo = this.inner.auth.getUserInfo();

    if (userInfo == null) throw new Error("No user info found");

    return userInfo;
  };

  getAuthDetails = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    const userInfo = this.inner.auth.getUserInfo();

    if (userInfo == null) throw new Error("No user info found");

    return userInfo;
  };
}
