import {
  WalletClientSigner,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import {
  AuthProvider,
  type ConstructorParams,
  type UserInfo,
} from "@arcana/auth";
import {
  createWalletClient,
  custom,
  type Hash,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import type { ArcanaAuthAuthenticationParams } from "./types";

/**
 * This class requires the `@arcana/auth` package as a dependency.
 * `@alchemy/aa-signers` lists it as optional dependencies.
 *
 * @see https://github.com/arcana-network/auth
 */
export class ArcanaAuthSigner
  implements
    SmartAccountAuthenticator<
      ArcanaAuthAuthenticationParams,
      UserInfo,
      AuthProvider
    >
{
  inner: AuthProvider;
  private signer: WalletClientSigner | undefined;

  constructor(
    params:
      | { clientId: string; params: Partial<ConstructorParams> }
      | { inner: AuthProvider }
  ) {
    if ("inner" in params) {
      this.inner = params.inner;
      return;
    }

    this.inner = new AuthProvider(params.clientId, params.params);
  }

  readonly signerType = "arcana-auth";

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

  authenticate = async (
    params: ArcanaAuthAuthenticationParams = {
      init: async () => {
        await this.inner.init();
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

    return this.inner.getUser();
  };

  getAuthDetails = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.inner.getUser();
  };
}
