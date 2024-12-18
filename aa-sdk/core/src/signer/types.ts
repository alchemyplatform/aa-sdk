import type { Address } from "abitype";
import type {
  Hex,
  SignableMessage,
  TypedData,
  TypedDataDefinition,
} from "viem";
import type { Authorization } from "viem/experimental";

// [!region SmartAccountAuthenticator]
/**
 * Extends the @interface SmartAccountSigner interface with authentication.
 *
 * @template AuthParams - the generic type of the authentication parameters
 * @template AuthDetails - the generic type of the authentication details
 * @template Inner - the generic type of the inner client that the signer wraps to provide functionality such as signing, etc.
 */
export interface SmartAccountAuthenticator<AuthParams, AuthDetails, Inner = any>
  extends SmartAccountSigner<Inner> {
  authenticate: (params: AuthParams) => Promise<AuthDetails>;

  getAuthDetails: () => Promise<AuthDetails>;
}
// [!endregion SmartAccountAuthenticator]

// [!region SmartAccountSigner]
/**
 * A signer that can sign messages and typed data.
 *
 * @template Inner - the generic type of the inner client that the signer wraps to provide functionality such as signing, etc.
 */
export interface SmartAccountSigner<Inner = any> {
  signerType: string;
  inner: Inner;

  getAddress: () => Promise<Address>;

  signMessage: (message: SignableMessage) => Promise<Hex>;

  signTypedData: <
    const TTypedData extends TypedData | Record<string, unknown>,
    TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ) => Promise<Hex>;

  signAuthorization?: (
    unsignedAuthorization: Authorization<number, false>
  ) => Promise<Authorization<number, true>> | undefined;
}
// [!endregion SmartAccountSigner]
