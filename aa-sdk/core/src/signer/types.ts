import type { Address } from "abitype";
import type {
  Hex,
  OneOf,
  SignableMessage,
  TypedData,
  TypedDataDefinition,
  SignedAuthorization,
} from "viem";

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
// TODO: This is a temporary type to be removed when viem is updated
export type AuthorizationRequest<uint32 = number> = OneOf<
  | {
      address: Address;
    }
  | {
      contractAddress: Address;
    }
> & {
  /** Chain ID. */
  chainId: uint32;
  /** Nonce of the EOA to delegate to. */
  nonce: uint32;
};

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
    unsignedAuthorization: AuthorizationRequest<number>
  ) => Promise<SignedAuthorization<number>>;
}
// [!endregion SmartAccountSigner]
