import {
  takeBytes,
  type SmartAccountAuthenticator,
  type AuthorizationRequest,
} from "@aa-sdk/core";
import {
  hashMessage,
  hashTypedData,
  keccak256,
  serializeTransaction,
  type GetTransactionType,
  type Hex,
  type IsNarrowable,
  type LocalAccount,
  type SerializeTransactionFn,
  type SignableMessage,
  type SignedAuthorization,
  type TransactionSerializable,
  type TransactionSerialized,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { toAccount } from "viem/accounts";
import type { Mutate, StoreApi } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import type { BaseSignerClient } from "./client/base";
import {
  type EmailType,
  type MfaFactor,
  type OauthConfig,
  type OauthParams,
  type User,
  type VerifyMfaParams,
  type AddMfaParams,
  type AddMfaResult,
  type RemoveMfaParams,
  type AuthLinkingPrompt,
  type OauthProviderInfo,
  type IdTokenOnly,
  type AuthMethods,
} from "./client/types.js";
import { NotAuthenticatedError } from "./errors.js";
import { SignerLogger } from "./metrics.js";
import {
  SessionManager,
  type SessionManagerParams,
} from "./session/manager.js";
import type { SessionManagerEvents } from "./session/types";
import type { AuthParams } from "./signer";
import { SolanaSigner } from "./solanaSigner.js";
import {
  AlchemySignerStatus,
  type AlchemySignerEvent,
  type AlchemySignerEvents,
  type ErrorInfo,
  type ValidateMultiFactorsArgs,
} from "./types.js";
import { assertNever } from "./utils/typeAssertions.js";
import { hashAuthorization } from "viem/utils";

export interface BaseAlchemySignerParams<TClient extends BaseSignerClient> {
  client: TClient;
  sessionConfig?: Omit<SessionManagerParams, "client">;
  initialError?: ErrorInfo;
  initialAuthLinkingPrompt?: AuthLinkingPrompt;
}

type AlchemySignerStore = {
  user: User | null;
  status: AlchemySignerStatus;
  error: ErrorInfo | null;
  otpId?: string;
  isNewUser?: boolean;
  mfaStatus: {
    mfaRequired: boolean;
    mfaFactorId?: string;
    encryptedPayload?: string;
  };
  authLinkingStatus?: {
    email: string;
    providerName: string;
    idToken: string;
  };
};

type UnpackedSignature = {
  r: `0x${string}`;
  s: `0x${string}`;
  v: bigint;
};

type InternalStore = Mutate<
  StoreApi<AlchemySignerStore>,
  [["zustand/subscribeWithSelector", never]]
>;

export type EmailConfig = {
  mode?: "MAGIC_LINK" | "OTP";
};

export type SignerConfig = {
  email: EmailConfig;
};

type GetUserParams =
  | {
      type: "email";
      value: string;
    }
  | {
      type: "phone";
      value: string;
    };

/**
 * Base abstract class for Alchemy Signer, providing authentication and session management for smart accounts.
 * Implements the `SmartAccountAuthenticator` interface and handles various signer events.
 */
export abstract class BaseAlchemySigner<TClient extends BaseSignerClient>
  implements SmartAccountAuthenticator<AuthParams, User, TClient>
{
  signerType: "alchemy-signer" | "rn-alchemy-signer" = "alchemy-signer";
  inner: TClient;
  private sessionManager: SessionManager;
  private store: InternalStore;
  private config: Promise<SignerConfig>;

  /**
   * Initializes an instance with the provided client and session configuration.
   * This function sets up the internal store, initializes the session manager,
   * registers listeners and initializes the session manager to manage session state.
   *
   * @param {BaseAlchemySignerParams<TClient>} param0 Object containing the client and session configuration
   * @param {TClient} param0.client The client instance to be used internally
   * @param {SessionConfig} param0.sessionConfig Configuration for managing sessions
   * @param {ErrorInfo | undefined} param0.initialError Error already present on the signer when initialized, if any
   */
  constructor({
    client,
    sessionConfig,
    initialError,
    initialAuthLinkingPrompt,
  }: BaseAlchemySignerParams<TClient>) {
    this.inner = client;
    this.store = createStore(
      subscribeWithSelector(
        () =>
          ({
            user: null,
            status: AlchemySignerStatus.INITIALIZING,
            error: initialError ?? null,
            mfaStatus: {
              mfaRequired: false,
              mfaFactorId: undefined,
            },
          }) satisfies AlchemySignerStore,
      ),
    );
    // NOTE: it's important that the session manager share a client
    // with the signer. The SessionManager leverages the Signer's client
    // to manage session state.
    this.sessionManager = new SessionManager({
      ...sessionConfig,
      client: this.inner,
    });
    // register listeners first
    this.registerListeners();
    // then initialize so that we can catch those events
    this.sessionManager.initialize();
    this.config = this.fetchConfig();
    if (initialAuthLinkingPrompt) {
      this.setAuthLinkingPrompt(initialAuthLinkingPrompt);
    }
  }

  /**
   * Allows you to subscribe to events emitted by the signer
   *
   * @param {AlchemySignerEvent} event the event to subscribe to
   * @param {AlchemySignerEvents[AlchemySignerEvent]} listener the function to run when the event is emitted
   * @returns {() => void} a function to remove the listener
   */
  on = <E extends AlchemySignerEvent>(
    event: E,
    listener: AlchemySignerEvents[E],
  ) => {
    // NOTE: we're using zustand here to handle this because we are able to use the fireImmediately
    // option which deals with a possible race condition where the listener is added after the event
    // is fired. In the Client and SessionManager we use EventEmitter because it's easier to handle internally
    switch (event) {
      case "connected":
        return subscribeWithDelayedFireImmediately(
          this.store,
          ({ status }) => status,
          (status) =>
            status === AlchemySignerStatus.CONNECTED &&
            (listener as AlchemySignerEvents["connected"])(
              this.store.getState().user!,
            ),
        );
      case "disconnected":
        return subscribeWithDelayedFireImmediately(
          this.store,
          ({ status }) => status,
          (status) =>
            status === AlchemySignerStatus.DISCONNECTED &&
            (listener as AlchemySignerEvents["disconnected"])(),
        );
      case "statusChanged":
        return subscribeWithDelayedFireImmediately(
          this.store,
          ({ status }) => status,
          listener as AlchemySignerEvents["statusChanged"],
        );
      case "errorChanged":
        return subscribeWithDelayedFireImmediately(
          this.store,
          ({ error }) => error,
          (error) =>
            (listener as AlchemySignerEvents["errorChanged"])(
              error ?? undefined,
            ),
        );
      case "newUserSignup":
        return subscribeWithDelayedFireImmediately(
          this.store,
          ({ isNewUser }) => isNewUser,
          (isNewUser) => {
            if (isNewUser) (listener as AlchemySignerEvents["newUserSignup"])();
          },
        );
      case "mfaStatusChanged":
        return subscribeWithDelayedFireImmediately(
          this.store,
          ({ mfaStatus }) => mfaStatus,
          (mfaStatus) =>
            (listener as AlchemySignerEvents["mfaStatusChanged"])(mfaStatus),
        );
      case "emailAuthLinkingRequired":
        return subscribeWithDelayedFireImmediately(
          this.store,
          ({ authLinkingStatus }) => authLinkingStatus,
          (authLinkingStatus) => {
            if (authLinkingStatus) {
              (listener as AlchemySignerEvents["emailAuthLinkingRequired"])(
                authLinkingStatus.email,
              );
            }
          },
        );
      default:
        assertNever(event, `Unknown event type ${event}`);
    }
  };

  /**
   * Prepares the config needed to use popup-based OAuth login. This must be
   * called before calling `.authenticate` with params `{ type: "oauth", mode:
   * "popup" }`, and is recommended to be called on page load.
   *
   * This method exists because browsers may prevent popups from opening unless
   * triggered by user interaction, and so the OAuth config must already have
   * been fetched at the time a user clicks a social login button.
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * await signer.preparePopupOauth();
   * ```
   * @returns {Promise<OauthConfig>} the config which must be loaded before
   * using popup-based OAuth
   */
  preparePopupOauth = (): Promise<OauthConfig> => this.inner.initOauth();

  /**
   * Authenticate a user with either an email or a passkey and create a session for that user
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const result = await signer.authenticate({
   *  type: "email",
   *  email: "foo@mail.com",
   * });
   * ```
   *
   * @param {AuthParams} params - undefined if passkey login, otherwise an object with email and bundle to resolve
   * @returns {Promise<User>} the user that was authenticated
   */
  authenticate: (params: AuthParams) => Promise<User> = SignerLogger.profiled(
    "BaseAlchemySigner.authenticate",
    async (params) => {
      const { type } = params;
      const result = (() => {
        switch (type) {
          case "email":
            return this.authenticateWithEmail(params);
          case "sms":
            return this.authenticateWithSms(params);
          case "passkey":
            return this.authenticateWithPasskey(params);
          case "oauth":
            return this.authenticateWithOauth(params);
          case "oauthReturn":
            return this.handleOauthReturn(params);
          case "otp":
            return this.authenticateWithOtp(params);
          case "custom-jwt":
            return this.authenticateWithJwt(params);
          default:
            assertNever(type, `Unknown auth type: ${type}`);
        }
      })();

      this.trackAuthenticateType(params);

      return result.catch((error) => {
        /**
         * 2 things going on here:
         * 1. for oauth flows we expect the status to remain in authenticating
         * 2. we do the ternary, because if we explicitly pass in `undefined` for the status, zustand will set the value of status to `undefined`.
         * However, if we omit it, then it will not override the current value of status.
         */
        this.store.setState({
          error: toErrorInfo(error),
          ...(type === "oauthReturn" || type === "oauth"
            ? {}
            : { status: AlchemySignerStatus.DISCONNECTED }),
        });
        throw error;
      });
    },
  );

  private trackAuthenticateType = (params: AuthParams) => {
    const { type } = params;
    switch (type) {
      case "email": {
        // we just want to track the start of email auth
        if ("bundle" in params) return;
        SignerLogger.trackEvent({
          name: "signer_authnticate",
          data: { authType: "email" },
        });
        return;
      }
      case "sms": {
        // we just want to track the start of phone auth
        SignerLogger.trackEvent({
          name: "signer_authnticate",
          data: { authType: "sms" },
        });
        return;
      }
      case "passkey": {
        const isAnon = !("email" in params) && params.createNew == null;
        SignerLogger.trackEvent({
          name: "signer_authnticate",
          data: {
            authType: isAnon ? "passkey_anon" : "passkey_email",
          },
        });
        return;
      }
      case "custom-jwt": {
        SignerLogger.trackEvent({
          name: "signer_authnticate",
          data: {
            authType: "custom-jwt",
            provider: params.authProviderId,
          },
        });
        return;
      }
      case "oauth":
        SignerLogger.trackEvent({
          name: "signer_authnticate",
          data: {
            authType: "oauth",
            provider: params.authProviderId,
          },
        });
        break;
      case "oauthReturn":
        break;
      case "otp":
        SignerLogger.trackEvent({
          name: "signer_authnticate",
          data: { authType: "otp" },
        });
        break;
      default:
        assertNever(type, `Unknown auth type: ${type}`);
    }
  };

  /**
   * Clear a user session and log them out
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * await signer.disconnect();
   * ```
   *
   * @returns {Promise<void>} a promise that resolves when the user is logged out
   */
  disconnect: () => Promise<void> = async () => {
    await this.inner.disconnect();
  };

  /**
   * Gets the current logged in user
   * If a user has an ongoing session, it will use that session and
   * try to authenticate
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * // throws if not logged in
   * const user = await signer.getAuthDetails();
   * ```
   *
   * @throws if there is no user logged in
   * @returns {Promise<User>} the current user
   */
  getAuthDetails = async (): Promise<User> => {
    const sessionUser = await this.sessionManager.getSessionUser();
    if (sessionUser != null) {
      return sessionUser;
    }

    return this.inner.whoami();
  };

  /**
   * Retrieves the address of the current user by calling the `whoami` method on `this.inner`.
   *
   * @returns {Promise<string>} A promise that resolves to the address of the current user.
   */
  getAddress: () => Promise<`0x${string}`> = SignerLogger.profiled(
    "BaseAlchemySigner.getAddress",
    async () => {
      const { address } = await this.inner.whoami();

      return address;
    },
  );

  /**
   * Signs a raw message after hashing it.
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const signature = await signer.signMessage("Hello, world!");
   * ```
   *
   * @param {string} msg the message to be hashed and then signed
   * @returns {Promise<string>} a promise that resolves to the signed message
   */
  signMessage: (msg: SignableMessage) => Promise<`0x${string}`> =
    SignerLogger.profiled("BaseAlchemySigner.signMessage", async (msg) => {
      const messageHash = hashMessage(msg);

      const result = await this.inner.signRawMessage(messageHash);

      SignerLogger.trackEvent({
        name: "signer_sign_message",
      });

      return result;
    });

  /**
   * Signs a typed message by first hashing it and then signing the hashed message using the `signRawMessage` method.
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const signature = await signer.signTypedData({
   *  domain: {},
   *  types: {},
   *  primaryType: "",
   *  message: {},
   * });
   * ```
   *
   * @param {TypedDataDefinition<TTypedData, TPrimaryType>} params The parameters for the typed message to be hashed and signed
   * @returns {Promise<any>} A promise that resolves to the signed message
   */
  signTypedData: <
    const TTypedData extends TypedData | Record<string, unknown>,
    TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData,
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>,
  ) => Promise<Hex> = SignerLogger.profiled(
    "BaseAlchemySigner.signTypedData",
    async (params) => {
      const messageHash = hashTypedData(params);

      return this.inner.signRawMessage(messageHash);
    },
  );

  /**
   * Serializes a transaction, signs it with a raw message, and then returns the serialized transaction with the signature.
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const tx = await signer.signTransaction({
   *  to: "0x1234",
   *  value: "0x1234",
   *  data: "0x1234",
   * });
   * ```
   *
   * @param {Transaction} tx the transaction to be serialized and signed
   * @param {{serializer?: SerializeTransactionFn}} args options for serialization
   * @param {() => Hex} [args.serializer] an optional serializer function. If not provided, the default `serializeTransaction` function will be used
   * @returns {Promise<string>} a promise that resolves to the serialized transaction with the signature
   */
  signTransaction: <
    serializer extends
      SerializeTransactionFn<TransactionSerializable> = SerializeTransactionFn<TransactionSerializable>,
    transaction extends Parameters<serializer>[0] = Parameters<serializer>[0],
  >(
    transaction: transaction,
    options?:
      | {
          serializer?: serializer | undefined;
        }
      | undefined,
  ) => Promise<
    IsNarrowable<
      TransactionSerialized<GetTransactionType<transaction>>,
      Hex
    > extends true
      ? TransactionSerialized<GetTransactionType<transaction>>
      : Hex
  > = SignerLogger.profiled(
    "BaseAlchemySigner.signTransaction",
    async (tx, args) => {
      const serializeFn = args?.serializer ?? serializeTransaction;
      const serializedTx = serializeFn(tx);
      const signatureHex = await this.inner.signRawMessage(
        keccak256(serializedTx),
      );

      const signature = this.unpackSignRawMessageBytes(signatureHex);

      return serializeFn(tx, signature);
    },
  );

  /**
   * Signs an EIP-7702 Authorization and then returns the authorization with the signature.
   *
   * @example
   * ```ts twoslash
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const tx = await signer.signAuthorization({
   *  contractAddress: "0x1234123412341234123412341234123412341234",
   *  chainId: 1,
   *  nonce: 0,
   * });
   * ```
   *
   * @param {AuthorizationRequest<number>} unsignedAuthorization the authorization to be signed
   * @returns {Promise<SignedAuthorization<number>> | undefined} a promise that resolves to the authorization with the signature
   */
  signAuthorization: (
    unsignedAuthorization: AuthorizationRequest<number>,
  ) => Promise<SignedAuthorization<number>> = SignerLogger.profiled(
    "BaseAlchemySigner.signAuthorization",
    async (unsignedAuthorization) => {
      const hashedAuthorization = hashAuthorization(unsignedAuthorization);
      const signedAuthorizationHex =
        await this.inner.signRawMessage(hashedAuthorization);
      const signature = this.unpackSignRawMessageBytes(signedAuthorizationHex);
      const { address, contractAddress, ...unsignedAuthorizationRest } =
        unsignedAuthorization;

      return {
        ...unsignedAuthorizationRest,
        ...signature,
        address: address ?? contractAddress,
      };
    },
  );

  /**
   * Gets the current MFA status
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const mfaStatus = signer.getMfaStatus();
   * if (mfaStatus === AlchemyMfaStatus.REQUIRED) {
   *   // Handle MFA requirement
   * }
   * ```
   *
   * @returns {{ mfaRequired: boolean; mfaFactorId?: string }} The current MFA status
   */
  getMfaStatus = (): {
    mfaRequired: boolean;
    mfaFactorId?: string;
  } => {
    return this.store.getState().mfaStatus;
  };

  private unpackSignRawMessageBytes = (
    hex: `0x${string}`,
  ): UnpackedSignature => {
    return {
      r: takeBytes(hex, { count: 32 }),
      s: takeBytes(hex, { count: 32, offset: 32 }),
      v: BigInt(takeBytes(hex, { count: 1, offset: 64 })),
    };
  };

  /**
   * Unauthenticated call to look up a user's organizationId by email
   *
   * @deprecated Use getUser({ type: "email", value: email }) instead
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const result = await signer.getUser("foo@mail.com");
   * ```
   *
   * @param {string} email the email to lookup
   * @returns {Promise<{orgId: string}>} the organization id for the user if they exist
   */
  getUser(email: string): Promise<{ orgId: string } | null>;
  /**
   * Unauthenticated call to look up a user's organizationId by email or phone
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const result = await signer.getUser({ type: "email", value: "foo@mail.com" });
   * ```
   *
   * @param {string} email the email to lookup
   * @returns {Promise<{orgId: string}>} the organization id for the user if they exist
   */
  getUser(params: GetUserParams): Promise<{ orgId: string } | null>;
  /**
   * Unauthenticated call to look up a user's organizationId by email or phone
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const result = await signer.getUser({ type: "email", value: "foo@mail.com" });
   * ```
   *
   * @param {string | GetUserParams} params the params to look up
   * @returns {Promise<{orgId: string}>} the organization id for the user if they exist
   */
  getUser(params: string | GetUserParams): Promise<{ orgId: string } | null> {
    return SignerLogger.profiled(
      "BaseAlchemySigner.getUser",
      async (params: string | GetUserParams) => {
        const _params =
          typeof params === "string"
            ? { type: "email" as const, value: params }
            : params;

        const result =
          _params.type === "email"
            ? await this.inner.lookupUserByEmail(_params.value)
            : _params.type === "phone"
              ? await this.inner.lookupUserByPhone(_params.value)
              : assertNever(_params, "unhandled get user params");

        if (result?.orgId == null) {
          return null;
        }

        return {
          orgId: result.orgId,
        };
      },
    )(params);
  }

  /*
   * Sets the email for the authenticated user, allowing them to login with that
   * email.
   *
   * You must contact Alchemy to enable this feature for your team, as there are
   * important security considerations. In particular, you must not call this
   * without first validating that the user owns this email account.
   *
   * @param {string} email The email to set for the user
   * @returns {Promise<void>} A promise that resolves when the email is set
   * @throws {NotAuthenticatedError} If the user is not authenticated
   */
  setEmail: (email: string) => Promise<void> = SignerLogger.profiled(
    "BaseAlchemySigner.setEmail",
    async (email) => {
      return this.inner.setEmail(email);
    },
  );

  /**
   * Removes the email for the authenticated user, disallowing them from login with that email.
   *
   * @returns {Promise<void>} A promise that resolves when the email is removed
   * @throws {NotAuthenticatedError} If the user is not authenticated
   */
  removeEmail: () => Promise<void> = SignerLogger.profiled(
    "BaseAlchemySigner.removeEmail",
    async () => {
      return this.inner.removeEmail();
    },
  );

  /**
   * Adds a passkey to the user's account
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const result = await signer.addPasskey()
   * ```
   *
   * @param {CredentialCreationOptions | undefined} params optional parameters for the passkey creation
   * @returns {Promise<string[]>} an array of the authenticator ids added to the user
   */
  addPasskey: (params?: CredentialCreationOptions) => Promise<string[]> =
    SignerLogger.profiled("BaseAlchemySigner.addPasskey", async (params) => {
      return this.inner.addPasskey(params ?? {});
    });

  /**
   * Removes a passkey from a user's account
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const authMethods = await signer.listAuthMethods();
   * const passkey = authMethods.passkeys[0];
   *
   * const result = await signer.removePasskey(passkey.authenticatorId);
   * ```
   *
   * @param {CredentialCreationOptions | undefined} params optional parameters for the passkey creation
   * @returns {Promise<string[]>} an array of the authenticator ids added to the user
   */
  removePasskey: (authenticatorId: string) => Promise<void> =
    SignerLogger.profiled(
      "BaseAlchemySigner.removePasskey",
      async (authenticatorId) => {
        return this.inner.removePasskey(authenticatorId);
      },
    );

  getPasskeyStatus: () => Promise<{ isPasskeyAdded: boolean }> =
    SignerLogger.profiled("BaseAlchemySigner.getPasskeyStatus", async () => {
      return this.inner.getPasskeyStatus();
    });

  /**
   * Used to export the wallet for a given user
   * If the user is authenticated with an Email, this will return a seed phrase
   * If the user is authenticated with a Passkey, this will return a private key
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * // the params passed to this are different based on the specific signer
   * const result = signer.exportWallet()
   * ```
   *
   * @param {unknown} params export wallet parameters
   * @returns {boolean} true if the wallet was exported successfully
   */
  exportWallet: (
    params: Parameters<(typeof this.inner)["exportWallet"]>[0],
  ) => Promise<boolean> = async (params) => {
    return this.inner.exportWallet(params);
  };

  /**
   * This method lets you adapt your AlchemySigner to a viem LocalAccount, which
   * will let you use the signer as an EOA directly.
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const account = signer.toViemAccount();
   * ```
   *
   * @throws if your signer is not authenticated
   * @returns {LocalAccount} a LocalAccount object that can be used with viem's wallet client
   */
  toViemAccount = (): LocalAccount => {
    // if we want this method to be synchronous, then we need to do this check here
    // otherwise we can use the sessionManager to get the user
    if (!this.inner.getUser()) {
      throw new NotAuthenticatedError();
    }

    return toAccount({
      address: this.inner.getUser()!.address,
      signMessage: (msg) => this.signMessage(msg.message),
      signTypedData: <
        const typedData extends TypedData | Record<string, unknown>,
        primaryType extends keyof typedData | "EIP712Domain" = keyof typedData,
      >(
        typedDataDefinition: TypedDataDefinition<typedData, primaryType>,
      ) => this.signTypedData<typedData, primaryType>(typedDataDefinition),
      signTransaction: this.signTransaction,
    });
  };

  /**
   * Creates a new instance of `SolanaSigner` using the provided inner value.
   * This requires the signer to be authenticated first
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const solanaSigner = signer.toSolanaSigner();
   * ```
   *
   * @returns {SolanaSigner} A new instance of `SolanaSigner`
   */
  toSolanaSigner = (): SolanaSigner => {
    if (!this.inner.getUser()) {
      throw new NotAuthenticatedError();
    }

    return new SolanaSigner(this.inner);
  };

  private authenticateWithEmail = async (
    params: Extract<AuthParams, { type: "email" }>,
  ): Promise<User> => {
    if ("bundle" in params) {
      return this.completeEmailAuth(params);
    }

    const { orgId, otpId, isNewUser } = await this.initOrCreateEmailUser(
      params.email,
      params.emailMode,
      params.multiFactors,
      params.redirectParams,
    );

    this.setAwaitingEmailAuth({ orgId, otpId, isNewUser });

    // Clear the auth linking status if the email has changed. This would mean
    // that the previously initiated social login is not associated with the
    // email which is now being used to login.
    const { authLinkingStatus } = this.store.getState();
    if (authLinkingStatus && authLinkingStatus.email !== params.email) {
      this.store.setState({ authLinkingStatus: undefined });
    }

    // We wait for the session manager to emit a connected event if
    // cross tab sessions are permitted
    return this.waitForConnected();
  };

  private authenticateWithSms = async (
    params: Extract<AuthParams, { type: "sms" }>,
  ): Promise<User> => {
    const { orgId, otpId, isNewUser } = await this.initOrCreateSmsUser(
      params.phone,
    );

    this.setAwaitingSmsAuth({ orgId, otpId, isNewUser });

    // TODO: add phone auth linking
    // // Clear the auth linking status if the email has changed. This would mean
    // // that the previously initiated social login is not associated with the
    // // email which is now being used to login.
    // const { authLinkingStatus } = this.store.getState();
    // if (authLinkingStatus && authLinkingStatus.email !== params.email) {
    //   this.store.setState({ authLinkingStatus: undefined });
    // }

    // We wait for the session manager to emit a connected event if
    // cross tab sessions are permitted
    return this.waitForConnected();
  };

  private authenticateWithPasskey = async (
    args: Extract<AuthParams, { type: "passkey" }>,
  ): Promise<User> => {
    let user: User;
    const shouldCreateNew = async () => {
      if ("email" in args) {
        const existingUser = await this.getUser({
          type: "email",
          value: args.email,
        });
        return existingUser == null;
      }

      return args.createNew;
    };

    if (await shouldCreateNew()) {
      const result = await this.inner.createAccount(
        args as Extract<
          AuthParams,
          { type: "passkey" } & ({ email: string } | { createNew: true })
        >,
      );
      // account creation for passkeys returns the whoami response so we don't have to
      // call it again after signup
      user = {
        address: result.address!,
        userId: result.userId!,
        orgId: result.orgId,
      };
    } else {
      user = await this.inner.lookupUserWithPasskey();
      if (!user) {
        this.store.setState({
          status: AlchemySignerStatus.DISCONNECTED,
        });
        throw new Error("No user found");
      }
    }

    return user;
  };

  private authenticateWithOauth = async (
    args: Extract<AuthParams, { type: "oauth" }>,
  ): Promise<User> => {
    this.store.setState({ authLinkingStatus: undefined });
    const params: OauthParams = {
      ...args,
      expirationSeconds: this.getExpirationSeconds(),
    };
    if (params.mode === "redirect") {
      const user = await this.inner.oauthWithRedirect(params);
      if (!isUser(user)) {
        throw new Error("Expected user from oauth with redirect");
      }
      return user;
    }
    const result = await this.inner.oauthWithPopup(params);
    if (isIdTokenOnly(result)) {
      throw new Error(
        "Should not get only id token when authenticating with oauth",
      );
    }
    if (!isAuthLinkingPrompt(result)) {
      return result;
    }
    this.setAuthLinkingPrompt(result);
    return this.waitForConnected();
  };

  /**
   * Handles OAuth authentication by augmenting the provided arguments with a type and performing authentication based on the OAuth mode (either using redirect or popup).
   *
   * @param {Omit<Extract<AuthParams, { type: "oauth" }>, "type">} args Authentication parameters omitting the type, which will be set to "oauth"
   * @returns {Promise<OauthProviderInfo>} A promise that resolves to an `OauthProviderInfo` object containing provider information and the ID token.
   */
  public addOauthProvider = async (
    args: Omit<Extract<AuthParams, { type: "oauth" }>, "type">,
  ): Promise<OauthProviderInfo> => {
    // This cast is required to suppress a spurious type error. We're just
    // putting the omitted field back in, but TypeScript doesn't recognize that.
    const argsWithType = { type: "oauth", ...args } as Extract<
      AuthParams,
      { type: "oauth" }
    >;
    const params: OauthParams = {
      ...argsWithType,
      fetchIdTokenOnly: true,
    };
    const result = await (params.mode === "redirect"
      ? this.inner.oauthWithRedirect(params)
      : this.inner.oauthWithPopup(params));
    if (!isIdTokenOnly(result)) {
      throw new Error("Expected id token only from oauth response");
    }
    return await this.inner.addOauthProvider({
      providerName: result.providerName,
      oidcToken: result.idToken,
    });
  };

  /**
   * Removes an OAuth provider by its ID if the user is authenticated.
   *
   * @param {string} providerId The ID of the OAuth provider to be removed, as obtained from `listOauthProviders`
   * @returns {Promise<any>} A promise indicating the result of the removal process
   * @throws {NotAuthenticatedError} Thrown if the user is not authenticated
   */
  public removeOauthProvider = async (providerId: string) => {
    if (!this.inner.getUser()) {
      throw new NotAuthenticatedError();
    }
    return this.inner.removeOauthProvider(providerId);
  };

  /**
   * Retrieves a list of auth methods associated with the authenticated user.
   *
   * @returns {Promise<AuthMethods>} A promise that resolves to an `AuthMethods` object containing the user's email, OAuth providers, and passkeys.
   * @throws {NotAuthenticatedError} Thrown if the user is not authenticated
   */
  public listAuthMethods = async (): Promise<AuthMethods> => {
    if (!this.inner.getUser()) {
      throw new NotAuthenticatedError();
    }
    return this.inner.listAuthMethods();
  };

  private authenticateWithJwt = async (
    args: Extract<AuthParams, { type: "custom-jwt" }>,
  ): Promise<User> => {
    const { credentialBundle, orgId, isSignUp } = await this.inner.submitJwt({
      jwt: args.jwt,
      authProvider: args.authProviderId,
      expirationSeconds: this.getExpirationSeconds(),
    });

    const user = await this.inner.completeAuthWithBundle({
      bundle: credentialBundle,
      orgId: orgId,
      connectedEventName: "connectedJwt",
      authenticatingType: "custom-jwt",
    });

    this.emitNewUserEvent(isSignUp);
    return user;
  };

  private authenticateWithOtp = async (
    args: Extract<AuthParams, { type: "otp" }>,
  ): Promise<User> => {
    const tempSession = this.sessionManager.getTemporarySession();
    const { orgId, isNewUser } = tempSession ?? {};
    const { otpId } = this.store.getState();
    if (!orgId) {
      throw new Error("orgId not found in session");
    }
    if (!otpId) {
      throw new Error("otpId not found in session");
    }

    const response = await this.inner.submitOtpCode({
      orgId,
      otpId,
      otpCode: args.otpCode,
      expirationSeconds: this.getExpirationSeconds(),
      multiFactors: args.multiFactors,
    });

    if (response.mfaRequired) {
      this.handleMfaRequired(response.encryptedPayload, response.multiFactors);
      return this.waitForConnected();
    }

    const user = await this.inner.completeAuthWithBundle({
      bundle: response.bundle,
      orgId,
      connectedEventName: "connectedOtp",
      authenticatingType: "otp",
    });

    this.emitNewUserEvent(isNewUser);
    if (tempSession) {
      this.sessionManager.setTemporarySession({
        ...tempSession,
        isNewUser: false,
      });
    }

    const { authLinkingStatus } = this.store.getState();
    if (authLinkingStatus) {
      (async () => {
        this.inner.addOauthProvider({
          providerName: authLinkingStatus.providerName,
          oidcToken: authLinkingStatus.idToken,
        });
      })();
    }

    return user;
  };

  private setAwaitingEmailAuth = ({
    orgId,
    otpId,
    isNewUser,
  }: {
    orgId: string;
    otpId?: string;
    isNewUser?: boolean;
  }): void => {
    this.sessionManager.setTemporarySession({
      orgId,
      isNewUser,
    });
    this.store.setState({
      status: AlchemySignerStatus.AWAITING_EMAIL_AUTH,
      otpId,
      error: null,
    });
  };

  private setAwaitingSmsAuth = ({
    orgId,
    otpId,
    isNewUser,
  }: {
    orgId: string;
    otpId?: string;
    isNewUser?: boolean;
  }): void => {
    this.sessionManager.setTemporarySession({
      orgId,
      isNewUser,
    });
    this.store.setState({
      status: AlchemySignerStatus.AWAITING_SMS_AUTH,
      otpId,
      error: null,
    });
  };

  private handleOauthReturn = ({
    bundle,
    orgId,
    idToken,
    isNewUser,
  }: Extract<AuthParams, { type: "oauthReturn" }>): Promise<User> => {
    const user = this.inner.completeAuthWithBundle({
      bundle,
      orgId,
      connectedEventName: "connectedOauth",
      authenticatingType: "oauth",
      idToken,
    });

    this.emitNewUserEvent(isNewUser);

    return user;
  };

  private handleMfaRequired(
    encryptedPayload: string,
    multiFactors: MfaFactor[],
  ) {
    // Store complete MFA context in the temporary session
    const tempSession = this.sessionManager.getTemporarySession();
    if (tempSession) {
      this.sessionManager.setTemporarySession({
        ...tempSession,
        encryptedPayload,
        mfaFactorId: multiFactors?.[0]?.multiFactorId,
      });
    }

    // Keep minimal state in the store for UI updates
    this.store.setState({
      status: AlchemySignerStatus.AWAITING_MFA_AUTH,
      error: null,
      mfaStatus: {
        mfaRequired: true,
        mfaFactorId: multiFactors?.[0]?.multiFactorId,
      },
    });
  }

  private getExpirationSeconds = () =>
    Math.floor(this.sessionManager.expirationTimeMs / 1000);

  private registerListeners = () => {
    // Declare listeners in an object to typecheck that every event type is
    // handled.
    const listeners: SessionManagerEvents = {
      connected: (session) => {
        this.store.setState({
          user: session.user,
          status: AlchemySignerStatus.CONNECTED,
          error: null,
        });
      },
      disconnected: () => {
        this.store.setState({
          user: null,
          status: AlchemySignerStatus.DISCONNECTED,
        });
      },
      initialized: () => {
        this.store.setState((state) => ({
          status: state.user
            ? AlchemySignerStatus.CONNECTED
            : AlchemySignerStatus.DISCONNECTED,
          ...(state.user ? { error: null } : undefined),
        }));
      },
    };

    for (const [event, listener] of Object.entries(listeners)) {
      this.sessionManager.on(event as keyof SessionManagerEvents, listener);
    }

    this.inner.on("authenticating", ({ type }) => {
      const status = (() => {
        switch (type) {
          case "email":
            return AlchemySignerStatus.AUTHENTICATING_EMAIL;
          case "passkey":
            return AlchemySignerStatus.AUTHENTICATING_PASSKEY;
          case "oauth":
            return AlchemySignerStatus.AUTHENTICATING_OAUTH;
          case "otp":
          case "otpVerify":
            return AlchemySignerStatus.AWAITING_OTP_AUTH;
          case "sms":
            return AlchemySignerStatus.AWAITING_SMS_AUTH;
          case "custom-jwt":
            return AlchemySignerStatus.AUTHENTICATING_JWT;
          default:
            assertNever(type, "unhandled authenticating type");
        }
      })();

      // trigger new user event on signer from client
      this.inner.on("newUserSignup", () => {
        this.emitNewUserEvent(true);
      });

      this.store.setState({
        status,
        error: null,
      });
    });
  };

  private emitNewUserEvent = (isNewUser?: boolean) => {
    // assumes that if isNewUser is undefined it is a returning user
    if (isNewUser) this.store.setState({ isNewUser });
  };

  private async initOrCreateEmailUser(
    email: string,
    emailMode?: EmailType,
    multiFactors?: VerifyMfaParams[],
    redirectParams?: URLSearchParams,
  ): Promise<{
    orgId: string;
    otpId?: string;
    isNewUser: boolean;
  }> {
    const existingUser = await this.getUser(email);
    const expirationSeconds = this.getExpirationSeconds();

    if (existingUser) {
      const { orgId, otpId } = await this.inner.initEmailAuth({
        email: email,
        emailMode: emailMode,
        expirationSeconds,
        redirectParams: redirectParams,
        multiFactors,
      });
      return {
        orgId,
        otpId,
        isNewUser: false,
      };
    }

    const { orgId, otpId } = await this.inner.createAccount({
      type: "email",
      email,
      emailMode,
      expirationSeconds,
      redirectParams,
    });
    return {
      orgId,
      otpId,
      isNewUser: true,
    };
  }

  private async initOrCreateSmsUser(phone: string): Promise<{
    orgId: string;
    otpId?: string;
    isNewUser: boolean;
  }> {
    const existingUser = await this.getUser({ type: "phone", value: phone });

    if (existingUser) {
      const { orgId, otpId } = await this.inner.initSmsAuth({
        phone,
      });
      return {
        orgId,
        otpId,
        isNewUser: false,
      };
    }

    const { orgId, otpId } = await this.inner.createAccount({
      type: "sms",
      phone,
    });
    return {
      orgId,
      otpId,
      isNewUser: true,
    };
  }

  private async completeEmailAuth(
    params: Extract<AuthParams, { type: "email"; bundle: string }>,
  ): Promise<User> {
    const temporarySession = params.orgId
      ? { orgId: params.orgId }
      : this.sessionManager.getTemporarySession();

    if (!temporarySession) {
      this.store.setState({ status: AlchemySignerStatus.DISCONNECTED });
      throw new Error("Could not find email auth init session!");
    }

    const user = await this.inner.completeAuthWithBundle({
      bundle: params.bundle,
      orgId: temporarySession.orgId,
      connectedEventName: "connectedEmail",
      authenticatingType: "email",
    });

    // fire new user event
    this.emitNewUserEvent(params.isNewUser);

    return user;
  }

  /**
   * Retrieves the list of MFA factors configured for the current user.
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const { multiFactors } = await signer.getMfaFactors();
   * ```
   *
   * @throws {NotAuthenticatedError} If no user is authenticated
   * @returns {Promise<{ multiFactors: Array<MfaFactor> }>} A promise that resolves to an array of configured MFA factors
   */
  getMfaFactors: () => Promise<{ multiFactors: MfaFactor[] }> =
    SignerLogger.profiled("BaseAlchemySigner.getMfaFactors", async () => {
      return this.inner.getMfaFactors();
    });

  /**
   * Initiates the setup of a new MFA factor for the current user.
   * The factor will need to be verified using verifyMfa before it becomes active.
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const result = await signer.addMfa({ multiFactorType: "totp" });
   * // Result contains multiFactorTotpUrl to display as QR code
   * ```
   *
   * @param {AddMfaParams} params The parameters required to enable a new MFA factor
   * @throws {NotAuthenticatedError} If no user is authenticated
   * @returns {Promise<AddMfaResult>} A promise that resolves to the factor setup information
   */
  addMfa: (params: AddMfaParams) => Promise<AddMfaResult> =
    SignerLogger.profiled("BaseAlchemySigner.addMfa", async (params) => {
      return this.inner.addMfa(params);
    });

  /**
   * Verifies a newly created MFA factor to complete the setup process.
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const result = await signer.verifyMfa({
   *   multiFactorId: "factor-id",
   *   multiFactorCode: "123456" // 6-digit code from authenticator app
   * });
   * ```
   *
   * @param {VerifyMfaParams} params The parameters required to verify the MFA factor
   * @throws {NotAuthenticatedError} If no user is authenticated
   * @returns {Promise<{ multiFactors: MfaFactor[] }>} A promise that resolves to the updated list of MFA factors
   */
  verifyMfa: (
    params: VerifyMfaParams,
  ) => Promise<{ multiFactors: MfaFactor[] }> = SignerLogger.profiled(
    "BaseAlchemySigner.verifyMfa",
    async (params) => {
      return this.inner.verifyMfa(params);
    },
  );

  /**
   * Removes existing MFA factors by their IDs.
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * const result = await signer.removeMfa({
   *   multiFactorIds: ["factor-id-1", "factor-id-2"]
   * });
   * ```
   *
   * @param {RemoveMfaParams} params The parameters specifying which factors to disable
   * @throws {NotAuthenticatedError} If no user is authenticated
   * @returns {Promise<{ multiFactors: MfaFactor[] }>} A promise that resolves to the updated list of MFA factors
   */
  removeMfa: (
    params: RemoveMfaParams,
  ) => Promise<{ multiFactors: MfaFactor[] }> = SignerLogger.profiled(
    "BaseAlchemySigner.removeMfa",
    async (params) => {
      return this.inner.removeMfa(params);
    },
  );

  /**
   * Validates MFA factors that were required during authentication.
   * This function should be called after MFA is required and the user has provided their MFA code.
   * It completes the authentication process by validating the MFA factors and completing the auth bundle.
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   *
   * // After MFA is required and user provides code
   * const user = await signer.validateMultiFactors({
   *   multiFactorCode: "123456", // 6-digit code from authenticator app
   *   multiFactorId: "factor-id"
   * });
   * ```
   *
   * @param {ValidateMultiFactorsArgs} params - Parameters for validating MFA factors
   * @throws {Error} If there is no pending MFA context or if orgId is not found
   * @returns {Promise<User>} A promise that resolves to the authenticated user
   */
  public async validateMultiFactors(
    params: ValidateMultiFactorsArgs,
  ): Promise<User> {
    // Get MFA context from temporary session
    const tempSession = this.sessionManager.getTemporarySession();
    if (
      !tempSession?.orgId ||
      !tempSession.encryptedPayload ||
      !tempSession.mfaFactorId
    ) {
      throw new Error(
        "No pending MFA context found. Call submitOtpCode() first.",
      );
    }

    if (
      params.multiFactorId &&
      tempSession.mfaFactorId !== params.multiFactorId
    ) {
      throw new Error("MFA factor ID mismatch");
    }

    // Call the low-level client
    const { bundle } = await this.inner.validateMultiFactors({
      encryptedPayload: tempSession.encryptedPayload,
      multiFactors: [
        {
          multiFactorId: tempSession.mfaFactorId,
          multiFactorCode: params.multiFactorCode,
        },
      ],
    });

    // Complete the authentication
    const user = await this.inner.completeAuthWithBundle({
      bundle,
      orgId: tempSession.orgId,
      connectedEventName: "connectedOtp",
      authenticatingType: "otp",
    });

    // Remove MFA data from temporary session
    this.sessionManager.setTemporarySession({
      ...tempSession,
      encryptedPayload: undefined,
      mfaFactorId: undefined,
    });

    // Update UI state
    this.store.setState({
      mfaStatus: {
        mfaRequired: false,
        mfaFactorId: undefined,
      },
    });

    return user;
  }

  protected initConfig = async (): Promise<SignerConfig> => {
    this.config = this.fetchConfig();
    return this.config;
  };

  /**
   * Returns the signer configuration while fetching it if it's not already initialized.
   *
   * @returns {Promise<SignerConfig>} A promise that resolves to the signer configuration
   */
  public getConfig = async (): Promise<SignerConfig> => {
    if (!this.config) {
      return this.initConfig();
    }

    return this.config;
  };

  protected fetchConfig = async (): Promise<SignerConfig> => {
    return this.inner.request("/v1/signer-config", {});
  };

  private setAuthLinkingPrompt = (prompt: AuthLinkingPrompt) => {
    this.setAwaitingEmailAuth({
      orgId: prompt.orgId,
      otpId: prompt.otpId,
      isNewUser: false,
    });
    this.store.setState({
      authLinkingStatus: {
        email: prompt.email,
        providerName: prompt.providerName,
        idToken: prompt.idToken,
      },
    });
  };

  private waitForConnected = (): Promise<User> => {
    return new Promise<User>((resolve) => {
      const removeListener = this.sessionManager.on("connected", (session) => {
        resolve(session.user);
        removeListener();
      });
    });
  };
}

function toErrorInfo(error: unknown): ErrorInfo {
  return error instanceof Error
    ? { name: error.name, message: error.message }
    : { name: "Error", message: "Unknown error" };
}

// eslint-disable-next-line jsdoc/require-param, jsdoc/require-returns
/**
 * Zustand's `fireImmediately` option calls the listener before
 * `store.subscribe` has returned, which breaks listeners which call
 * unsubscribe, e.g.
 *
 * ```ts
 * const unsubscribe = store.subscribe(
 *   selector,
 *   (update) => {
 *     handleUpdate(update);
 *     unsubscribe();
 *   },
 *   { fireImmediately: true },
 * )
 * ```
 *
 * since `unsubscribe` is still undefined at the time the listener is called. To
 * prevent this, if the listener triggers before `subscribe` has returned, delay
 * the callback to a later run of the event loop.
 */
function subscribeWithDelayedFireImmediately<T>(
  store: InternalStore,
  selector: (state: AlchemySignerStore) => T,
  listener: (selectedState: T, previousSelectedState: T) => void,
): () => void {
  // Until this function has returned, maintain a queue of events that will be
  // processed once it does.
  const queue: [selectedState: T, previousSelectedState: T][] = [];
  let queueHasEmptied = false;
  let hasUnsubscribed = false;

  function drainQueue() {
    // Note that this handles the case where more events are added to the queue
    // during the handling of previous events.
    for (let i = 0; i < queue.length && !hasUnsubscribed; i++) {
      const args = queue[i];
      listener(...args);
    }
    queueHasEmptied = true;
  }

  // Schedule the queue to be drained after this function has returned.
  setTimeout(drainQueue, 0);

  const unsubscribe = store.subscribe(
    selector,
    (...args) => {
      if (queueHasEmptied) {
        listener(...args);
      } else {
        queue.push(args);
      }
    },
    { fireImmediately: true },
  );

  return () => {
    hasUnsubscribed = true;
    unsubscribe();
  };
}

function isUser(
  result: User | AuthLinkingPrompt | IdTokenOnly,
): result is User {
  return !isAuthLinkingPrompt(result) && !isIdTokenOnly(result);
}

function isAuthLinkingPrompt(result: unknown): result is AuthLinkingPrompt {
  return (
    (result as AuthLinkingPrompt)?.status ===
    "ACCOUNT_LINKING_CONFIRMATION_REQUIRED"
  );
}

function isIdTokenOnly(result: unknown): result is IdTokenOnly {
  return (result as IdTokenOnly)?.status === "FETCHED_ID_TOKEN_ONLY";
}
