import type { Address } from "abitype";
import type { Hex, TypedData, TypedDataDefinition } from "viem";

/**
 * Extends the @interface SmartAccountSigner interface with authentication.
 *
 * @template AuthParams - the generic type of the authentication parameters
 * @template AuthDetails - the generic type of the authentication details
 * @template Inner - the generic type of the inner client that the signer wraps to provide functionality such as signing, etc.
 *
 * @method authenticate - authenticate the signer
 * @method getAuthDetails - get the authentication details
 */
export interface SmartAccountAuthenticator<AuthParams, AuthDetails, Inner = any>
  extends SmartAccountSigner<Inner> {
  authenticate: (params: AuthParams) => Promise<AuthDetails>;

  getAuthDetails: () => Promise<AuthDetails>;
}

/**
 * A signer that can sign messages and typed data.
 *
 * @template Inner - the generic type of the inner client that the signer wraps to provide functionality such as signing, etc.
 *
 * @var signerType - the type of the signer (e.g. local, hardware, etc.)
 * @var inner - the inner client of @type {Inner}
 *
 * @method getAddress - get the address of the signer
 * @method signMessage - sign a message
 * @method signTypedData - sign typed data
 */
export interface SmartAccountSigner<Inner = any> {
  signerType: string;
  inner: Inner;

  getAddress: () => Promise<Address>;

  signMessage: (msg: Uint8Array | Hex | string) => Promise<Hex>;

  signTypedData: <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ) => Promise<Hex>;
}
