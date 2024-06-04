import { takeBytes, type SmartAccountAuthenticator } from "@alchemy/aa-core";
import {
  hashMessage,
  hashTypedData,
  keccak256,
  serializeTransaction,
  type CustomSource,
  type Hex,
  type LocalAccount,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { toAccount } from "viem/accounts";
import type { Mutate, StoreApi } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import type { BaseSignerClient } from "./client/base";
import type { User } from "./client/types";
import { NotAuthenticatedError } from "./errors.js";
import {
  SessionManager,
  type SessionManagerParams,
} from "./session/manager.js";
import type { AuthParams } from "./signer";
import {
  AlchemySignerStatus,
  type AlchemySignerEvent,
  type AlchemySignerEvents,
} from "./types.js";

export interface BaseAlchemySignerParams<TClient extends BaseSignerClient> {
  client: TClient;
  sessionConfig?: Omit<SessionManagerParams, "client">;
}

type AlchemySignerStore = {
  user: User | null;
  status: AlchemySignerStatus;
};

type InternalStore = Mutate<
  StoreApi<AlchemySignerStore>,
  [["zustand/subscribeWithSelector", never]]
>;

export abstract class BaseAlchemySigner<TClient extends BaseSignerClient>
  implements SmartAccountAuthenticator<AuthParams, User, TClient>
{
  signerType: string = "alchemy-signer";
  inner: TClient;
  private sessionManager: SessionManager;
  private store: InternalStore;

  constructor({ client, sessionConfig }: BaseAlchemySignerParams<TClient>) {
    this.inner = client;
    this.store = createStore(
      subscribeWithSelector(
        () =>
          ({
            user: null,
            status: AlchemySignerStatus.INITIALIZING,
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
    this.store = createStore(
      subscribeWithSelector(
        () =>
          ({
            user: null,
            status: AlchemySignerStatus.INITIALIZING,
          } satisfies AlchemySignerStore)
      )
    );
    // register listeners first
    this.registerListeners();
    // then initialize so that we can catch those events
    this.sessionManager.initialize();
  }

  /**
   * Allows you to subscribe to events emitted by the signer
   *
   * @param event the event to subscribe to
   * @param listener the function to run when the event is emitted
   * @returns a function to remove the listener
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
      default:
        throw new Error(`Uknown event type ${event}`);
    }
  };

  /**
   * Authenticate a user with either an email or a passkey and create a session for that user
   *
   * @param params - undefined if passkey login, otherwise an object with email and bundle to resolve
   * @returns the user that was authenticated
   */
  authenticate: (params: AuthParams) => Promise<User> = async (params) => {
    if (params.type === "email") {
      return this.authenticateWithEmail(params);
    }

    return this.authenticateWithPasskey(params);
  };

  /**
   * NOTE: right now this only clears the session locally.
   */
  disconnect: () => Promise<void> = async () => {
    await this.inner.disconnect();
  };

  /**
   * Gets the current logged in user
   * If a user has an ongoing session, it will use that session and
   * try to authenticate
   *
   * @throws if there is no user logged in
   * @returns the current user
   */
  getAuthDetails: () => Promise<User> = async () => {
    const sessionUser = await this.sessionManager.getSessionUser();
    if (sessionUser != null) {
      return sessionUser;
    }

    return this.inner.whoami();
  };

  getAddress: () => Promise<`0x${string}`> = async () => {
    const { address } = await this.inner.whoami();

    return address;
  };

  signMessage: (msg: SignableMessage) => Promise<`0x${string}`> = async (
    msg
  ) => {
    const messageHash = hashMessage(msg);

    return this.inner.signRawMessage(messageHash);
  };

  signTypedData: <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends keyof TTypedData | "EIP712Domain" = keyof TTypedData
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ) => Promise<Hex> = async (params) => {
    const messageHash = hashTypedData(params);

    return this.inner.signRawMessage(messageHash);
  };

  signTransaction: CustomSource["signTransaction"] = async (tx, args) => {
    const serializeFn = args?.serializer ?? serializeTransaction;
    const serializedTx = serializeFn(tx);
    const signatureHex = await this.inner.signRawMessage(
      keccak256(serializedTx)
    );

    const signature = {
      r: takeBytes(signatureHex, { count: 32 }),
      s: takeBytes(signatureHex, { count: 32, offset: 32 }),
      v: BigInt(takeBytes(signatureHex, { count: 1, offset: 64 })),
    };

    return serializeFn(tx, signature);
  };

  /**
   * Unauthenticated call to look up a user's organizationId by email
   *
   * @param email the email to lookup
   * @returns the organization id for the user if they exist
   */
  getUser: (email: string) => Promise<{ orgId: string } | null> = async (
    email
  ) => {
    const result = await this.inner.lookupUserByEmail(email);

    if (result.orgId == null) {
      return null;
    }

    return {
      orgId: result.orgId,
    };
  };

  /**
   * Adds a passkey to the user's account
   *
   * @param params optional parameters for the passkey creation
   * @returns an array of the authenticator ids added to the user
   */
  addPasskey: (params?: CredentialCreationOptions) => Promise<string[]> =
    async (params) => {
      return this.inner.addPasskey(params ?? {});
    };

  /**
   * Used to export the wallet for a given user
   * If the user is authenticated with an Email, this will return a seed phrase
   * If the user is authenticated with a Passkey, this will return a private key
   *
   * @param params export wallet parameters
   * @returns true if the wallet was exported successfully
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
   * @throws if your signer is not authenticated
   * @returns a LocalAccount object that can be used with viem's wallet client
   */
  toViemAccount: () => LocalAccount = () => {
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

  private authenticateWithEmail = async (
    params: Extract<AuthParams, { type: "email" }>
  ): Promise<User> => {
    if ("email" in params) {
      const existingUser = await this.getUser(params.email);

      const { orgId } = existingUser
        ? await this.inner.initEmailAuth({
            email: params.email,
            expirationSeconds: this.sessionManager.expirationTimeMs,
            redirectParams: params.redirectParams,
          })
        : await this.inner.createAccount({
            type: "email",
            email: params.email,
            expirationSeconds: this.sessionManager.expirationTimeMs,
            redirectParams: params.redirectParams,
          });

      this.sessionManager.setTemporarySession({ orgId });
      this.store.setState({ status: AlchemySignerStatus.AWAITING_EMAIL_AUTH });

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
        this.store.setState({ status: AlchemySignerStatus.DISCONNECTED });
        throw new Error("Could not find email auth init session!");
      }

      const user = await this.inner.completeEmailAuth({
        bundle: params.bundle,
        orgId: temporarySession.orgId,
      });

      return user;
    }
  };

  private authenticateWithPasskey = async (
    args: Extract<AuthParams, { type: "passkey" }>
  ) => {
    let user: User;
    if (args.createNew) {
      const result = await this.inner.createAccount(args);
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
        this.store.setState({ status: AlchemySignerStatus.DISCONNECTED });
        throw new Error("No user found");
      }
    }

    return user;
  };

  private registerListeners = () => {
    this.sessionManager.on("connected", (session) => {
      this.store.setState({
        user: session.user,
        status: AlchemySignerStatus.CONNECTED,
      });
    });

    this.sessionManager.on("disconnected", () => {
      this.store.setState({
        user: null,
        status: AlchemySignerStatus.DISCONNECTED,
      });
    });

    this.sessionManager.on("initialized", () => {
      this.store.setState((state) => ({
        status: state.user
          ? AlchemySignerStatus.CONNECTED
          : AlchemySignerStatus.DISCONNECTED,
      }));
    });

    this.inner.on("authenticating", () => {
      this.store.setState({ status: AlchemySignerStatus.AUTHENTICATING });
    });
  };
}
