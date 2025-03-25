import { takeBytes, type SmartAccountAuthenticator } from "@aa-sdk/core";
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
  type TransactionSerializable,
  type TransactionSerialized,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { toAccount } from "viem/accounts";
import { hashAuthorization, type Authorization } from "viem/experimental";
import type { Mutate, StoreApi } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import type { BaseSignerClient } from "./client/base";
import type { OauthConfig, OauthParams, User } from "./client/types";
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
} from "./types.js";
import { assertNever } from "./utils/typeAssertions.js";

export interface BaseAlchemySignerParams<TClient extends BaseSignerClient> {
  client: TClient;
  sessionConfig?: Omit<SessionManagerParams, "client">;
  initialError?: ErrorInfo;
}

type AlchemySignerStore = {
  user: User | null;
  status: AlchemySignerStatus;
  error: ErrorInfo | null;
  otpId?: string;
  isNewUser?: boolean;
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
  }: BaseAlchemySignerParams<TClient>) {
    this.inner = client;
    this.store = createStore(
      subscribeWithSelector(
        () =>
          ({
            user: null,
            status: AlchemySignerStatus.INITIALIZING,
            error: initialError ?? null,
          } satisfies AlchemySignerStore)
      )
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
    listener: AlchemySignerEvents[E]
  ) => {
    // NOTE: we're using zustand here to handle this because we are able to use the fireImmediately
    // option which deals with a possible race condition where the listener is added after the event
    // is fired. In the Client and SessionManager we use EventEmitter because it's easier to handle internally
    switch (event) {
      case "connected":
        return this.store.subscribe(
          ({ status }) => status,
          (status) =>
            status === AlchemySignerStatus.CONNECTED &&
            (listener as AlchemySignerEvents["connected"])(
              this.store.getState().user!
            ),
          { fireImmediately: true }
        );
      case "disconnected":
        return this.store.subscribe(
          ({ status }) => status,
          (status) =>
            status === AlchemySignerStatus.DISCONNECTED &&
            (listener as AlchemySignerEvents["disconnected"])(),
          { fireImmediately: true }
        );
      case "statusChanged":
        return this.store.subscribe(
          ({ status }) => status,
          listener as AlchemySignerEvents["statusChanged"],
          { fireImmediately: true }
        );
      case "errorChanged":
        return this.store.subscribe(
          ({ error }) => error,
          (error) =>
            (listener as AlchemySignerEvents["errorChanged"])(
              error ?? undefined
            ),
          { fireImmediately: true }
        );
      case "newUserSignup":
        return this.store.subscribe(
          ({ isNewUser }) => isNewUser,
          (isNewUser) => {
            if (isNewUser) (listener as AlchemySignerEvents["newUserSignup"])();
          },
          { fireImmediately: true }
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
    }
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
    }
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
    TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ) => Promise<Hex> = SignerLogger.profiled(
    "BaseAlchemySigner.signTypedData",
    async (params) => {
      const messageHash = hashTypedData(params);

      return this.inner.signRawMessage(messageHash);
    }
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
    serializer extends SerializeTransactionFn<TransactionSerializable> = SerializeTransactionFn<TransactionSerializable>,
    transaction extends Parameters<serializer>[0] = Parameters<serializer>[0]
  >(
    transaction: transaction,
    options?:
      | {
          serializer?: serializer | undefined;
        }
      | undefined
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
        keccak256(serializedTx)
      );

      const signature = this.unpackSignRawMessageBytes(signatureHex);

      return serializeFn(tx, signature);
    }
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
   * @param {Authorization<number, false>} unsignedAuthorization the authorization to be signed
   * @returns {Promise<Authorization<number, true>> | undefined} a promise that resolves to the authorization with the signature
   */
  signAuthorization: (
    unsignedAuthorization: Authorization<number, false>
  ) => Promise<Authorization<number, true>> = SignerLogger.profiled(
    "BaseAlchemySigner.signAuthorization",
    async (unsignedAuthorization) => {
      const hashedAuthorization = hashAuthorization(unsignedAuthorization);
      const signedAuthorizationHex = await this.inner.signRawMessage(
        hashedAuthorization
      );
      const signature = this.unpackSignRawMessageBytes(signedAuthorizationHex);
      return { ...unsignedAuthorization, ...signature };
    }
  );

  private unpackSignRawMessageBytes = (
    hex: `0x${string}`
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
  getUser: (email: string) => Promise<{ orgId: string } | null> =
    SignerLogger.profiled("BaseAlchemySigner.getUser", async (email) => {
      const result = await this.inner.lookupUserByEmail(email);

      if (result.orgId == null) {
        return null;
      }

      return {
        orgId: result.orgId,
      };
    });

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
    params: Parameters<(typeof this.inner)["exportWallet"]>[0]
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
        primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
      >(
        typedDataDefinition: TypedDataDefinition<typedData, primaryType>
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
  experimental_toSolanaSigner = (): SolanaSigner => {
    if (!this.inner.getUser()) {
      throw new NotAuthenticatedError();
    }

    return new SolanaSigner(this.inner);
  };

  private authenticateWithEmail = async (
    params: Extract<AuthParams, { type: "email" }>
  ): Promise<User> => {
    if ("email" in params) {
      const existingUser = await this.getUser(params.email);
      const expirationSeconds = this.getExpirationSeconds();

      const { orgId, otpId } = existingUser
        ? await this.inner.initEmailAuth({
            email: params.email,
            emailMode: params.emailMode,
            expirationSeconds,
            redirectParams: params.redirectParams,
          })
        : await this.inner.createAccount({
            type: "email",
            email: params.email,
            emailMode: params.emailMode,
            expirationSeconds,
            redirectParams: params.redirectParams,
          });

      this.sessionManager.setTemporarySession({
        orgId,
        isNewUser: !existingUser,
      });
      this.store.setState({
        status: AlchemySignerStatus.AWAITING_EMAIL_AUTH,
        otpId,
        error: null,
      });

      // We wait for the session manager to emit a connected event if
      // cross tab sessions are permitted
      return new Promise<User>((resolve) => {
        const removeListener = this.sessionManager.on(
          "connected",
          (session) => {
            resolve(session.user);
            removeListener();
          }
        );
      });
    } else {
      const temporarySession = params.orgId
        ? { orgId: params.orgId }
        : this.sessionManager.getTemporarySession();

      if (!temporarySession) {
        this.store.setState({
          status: AlchemySignerStatus.DISCONNECTED,
        });
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
  };

  private authenticateWithPasskey = async (
    args: Extract<AuthParams, { type: "passkey" }>
  ): Promise<User> => {
    let user: User;
    const shouldCreateNew = async () => {
      if ("email" in args) {
        const existingUser = await this.getUser(args.email);
        return existingUser == null;
      }

      return args.createNew;
    };

    if (await shouldCreateNew()) {
      const result = await this.inner.createAccount(
        args as Extract<
          AuthParams,
          { type: "passkey" } & ({ email: string } | { createNew: true })
        >
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
    args: Extract<AuthParams, { type: "oauth" }>
  ): Promise<User> => {
    const params: OauthParams = {
      ...args,
      expirationSeconds: this.getExpirationSeconds(),
    };
    if (params.mode === "redirect") {
      return this.inner.oauthWithRedirect(params);
    } else {
      return this.inner.oauthWithPopup(params);
    }
  };

  private authenticateWithJwt = async (
    args: Extract<AuthParams, { type: "custom-jwt" }>
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
    args: Extract<AuthParams, { type: "otp" }>
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
    const { bundle } = await this.inner.submitOtpCode({
      orgId,
      otpId,
      otpCode: args.otpCode,
      expirationSeconds: this.getExpirationSeconds(),
    });
    const user = await this.inner.completeAuthWithBundle({
      bundle,
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

    return user;
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
}

function toErrorInfo(error: unknown): ErrorInfo {
  return error instanceof Error
    ? { name: error.name, message: error.message }
    : { name: "Error", message: "Unknown error" };
}
