import EventEmitter from "eventemitter3";
import { z } from "zod";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { createStore, type Mutate, type StoreApi } from "zustand/vanilla";
import type { BaseSignerClient } from "../client/base";
import type {
  AlchemySignerClientEvent,
  AlchemySignerClientEvents,
  User,
} from "../client/types";
import { assertNever } from "../utils/typeAssertions.js";
import type { Session, SessionManagerEvents } from "./types";

export const DEFAULT_SESSION_MS = 15 * 60 * 1000; // 15 minutes

export const SessionManagerParamsSchema = z.object({
  sessionKey: z.string().default("alchemy-signer-session"),
  storage: z
    .enum(["localStorage", "sessionStorage"])
    .default("localStorage")
    .or(z.custom<Storage>()),
  expirationTimeMs: z
    .number()
    .default(DEFAULT_SESSION_MS)
    .describe(
      "The time in milliseconds that a session should last before expiring [default: 15 minutes]"
    ),
  client: z.custom<BaseSignerClient>(),
});

export type SessionManagerParams = z.input<typeof SessionManagerParamsSchema>;

type SessionState = {
  session: Session | null;
};

type Store = Mutate<
  StoreApi<SessionState>,
  [["zustand/subscribeWithSelector", never], ["zustand/persist", SessionState]]
>;

type TemporarySession = { orgId: string; isNewUser?: boolean };

export class SessionManager {
  private sessionKey: string;
  private client: BaseSignerClient;
  private eventEmitter: EventEmitter<SessionManagerEvents>;
  readonly expirationTimeMs: number;
  private store: Store;
  private clearSessionHandle: NodeJS.Timeout | null = null;

  constructor(params: SessionManagerParams) {
    const {
      sessionKey,
      storage: storageType,
      expirationTimeMs,
      client,
    } = SessionManagerParamsSchema.parse(params);
    this.sessionKey = sessionKey;
    const storage =
      typeof storageType === "string"
        ? storageType === "localStorage"
          ? localStorage
          : sessionStorage
        : storageType;
    this.expirationTimeMs = expirationTimeMs;
    this.client = client;
    this.eventEmitter = new EventEmitter<SessionManagerEvents>();

    this.store = createStore(
      subscribeWithSelector(
        persist(this.getInitialState, {
          name: this.sessionKey,
          storage: createJSONStorage<SessionState>(() => storage),
        })
      )
    );

    this.registerEventListeners();
  }

  public getSessionUser = async (): Promise<User | null> => {
    const existingSession = this.getSession();
    if (existingSession == null) {
      return null;
    }

    switch (existingSession.type) {
      case "email":
      case "oauth":
      case "custom-jwt":
      case "otp": {
        const connectedEventName = (() => {
          switch (existingSession.type) {
            case "email":
              return "connectedEmail";
            case "oauth":
              return "connectedOauth";
            case "otp":
              return "connectedOtp";
            case "custom-jwt":
              return "connectedJwt";
          }
        })();
        const result = await this.client
          .completeAuthWithBundle({
            bundle: existingSession.bundle,
            orgId: existingSession.user.orgId,
            authenticatingType: existingSession.type,
            connectedEventName,
            idToken: existingSession.user.idToken,
          })
          .catch((e) => {
            console.warn("Failed to load user from session", e);
            return null;
          });

        if (!result) {
          this.clearSession();
          return null;
        }

        return result;
      }
      case "passkey": {
        // we don't need to do much here if we already have a user
        // this will setup the client with the user context, but
        // requests still have to be signed by the user on first request
        // so this is fine
        return this.client.lookupUserWithPasskey(existingSession.user);
      }
      default:
        assertNever(
          existingSession,
          `Unknown session type: ${(existingSession as any).type}`
        );
    }
  };

  public clearSession = () => {
    this.store.setState({ session: null });
    localStorage.removeItem(`${this.sessionKey}:temporary`);

    if (this.clearSessionHandle) {
      clearTimeout(this.clearSessionHandle);
    }
  };

  public setTemporarySession = (session: TemporarySession) => {
    // temporary session must be placed in localStorage so that it can be accessed across tabs
    localStorage.setItem(
      `${this.sessionKey}:temporary`,
      JSON.stringify(session)
    );
  };

  public getTemporarySession = (): TemporarySession | null => {
    // temporary session must be placed in localStorage so that it can be accessed across tabs
    const sessionStr = localStorage.getItem(`${this.sessionKey}:temporary`);

    if (!sessionStr) {
      return null;
    }

    return JSON.parse(sessionStr);
  };

  on = <E extends keyof SessionManagerEvents>(
    event: E,
    listener: SessionManagerEvents[E]
  ) => {
    this.eventEmitter.on(event, listener as any);

    return () => this.eventEmitter.removeListener(event, listener as any);
  };

  private getSession = (): Session | null => {
    const session = this.store.getState().session;

    if (!session) {
      return null;
    }

    /**
     * TODO: this isn't really good enough
     * A user's session could be about to expire and we would still return it
     *
     * Instead we should check if a session is about to expire and refresh it
     * We should revisit this later
     */
    if (session.expirationDateMs < Date.now()) {
      this.client.disconnect();
      this.clearSession();
      return null;
    }

    this.registerSessionExpirationHandler(session);

    return session;
  };

  private setSession = (
    session_:
      | Omit<
          Extract<Session, { type: "email" | "oauth" | "otp" | "custom-jwt" }>,
          "expirationDateMs"
        >
      | Omit<Extract<Session, { type: "passkey" }>, "expirationDateMs">
  ) => {
    const session = {
      ...session_,
      expirationDateMs: Date.now() + this.expirationTimeMs,
    };

    this.registerSessionExpirationHandler(session);

    this.store.setState({ session });
  };

  public initialize() {
    this.getSessionUser()
      .then((user) => {
        // once we complete auth we can update the state of the session to connected or disconnected
        if (user) this.eventEmitter.emit("connected", this.getSession()!);
        else this.eventEmitter.emit("disconnected");
      })
      .finally(() => {
        this.eventEmitter.emit("initialized");
      });
  }

  private getInitialState(): SessionState {
    return {
      session: null,
    };
  }

  private registerEventListeners = () => {
    this.store.subscribe(
      ({ session }) => session,
      (session, prevSession) => {
        if (session != null && prevSession == null) {
          this.eventEmitter.emit("connected", session);
        } else if (session == null && prevSession != null) {
          this.eventEmitter.emit("disconnected");
        }
      }
    );

    // Helper type to ensure that a listener is either defined or explicitly
    // omitted for every event type.
    type Listeners = {
      [K in keyof AlchemySignerClientEvents]:
        | AlchemySignerClientEvents[K]
        | undefined;
    };

    const listeners: Listeners = {
      connected: undefined,
      newUserSignup: undefined,
      authenticating: undefined,
      connectedEmail: (user, bundle) =>
        this.setSessionWithUserAndBundle({ type: "email", user, bundle }),
      connectedPasskey: (user) => {
        const existingSession = this.getSession();
        if (
          existingSession != null &&
          existingSession.type === "passkey" &&
          existingSession.user.userId === user.userId
        ) {
          return;
        }

        this.setSession({ type: "passkey", user });
      },
      connectedOauth: (user, bundle) =>
        this.setSessionWithUserAndBundle({ type: "oauth", user, bundle }),
      connectedJwt: (user, bundle) =>
        this.setSessionWithUserAndBundle({ type: "custom-jwt", user, bundle }),
      connectedOtp: (user, bundle) => {
        this.setSessionWithUserAndBundle({ type: "otp", user, bundle });
      },
      disconnected: () => this.clearSession(),
    };

    for (const [event, listener] of Object.entries(listeners)) {
      if (listener) {
        this.client.on(event as AlchemySignerClientEvent, listener);
      }
    }

    // sync local state if persisted state has changed from another tab
    // only do this in the browser
    // Add a try catch to prevent potential crashes in non-browser environments
    try {
      if (
        typeof window !== "undefined" &&
        typeof window.addEventListener !== "undefined"
      ) {
        window.addEventListener("focus", () => {
          const oldSession = this.store.getState().session;
          this.store.persist.rehydrate();
          const newSession = this.store.getState().session;
          if (
            (oldSession?.expirationDateMs ?? 0) < Date.now() ||
            oldSession?.user.orgId !== newSession?.user.orgId ||
            oldSession?.user.userId !== newSession?.user.userId
          ) {
            // Initialize if the user has changed.
            this.initialize();
          }
        });
      }
    } catch (e) {
      console.error("Error registering event listeners", e);
    }
  };

  private registerSessionExpirationHandler = (session: Session) => {
    if (this.clearSessionHandle) {
      clearTimeout(this.clearSessionHandle);
    }

    this.clearSessionHandle = setTimeout(() => {
      this.client.disconnect();
      this.clearSession();
    }, Math.min(session.expirationDateMs - Date.now(), Math.pow(2, 31) - 1));
  };

  private setSessionWithUserAndBundle = ({
    type,
    user,
    bundle,
  }: {
    type: "email" | "oauth" | "otp" | "custom-jwt";
    user: User;
    bundle: string;
  }) => {
    const existingSession = this.getSession();
    if (
      existingSession != null &&
      existingSession.type === type &&
      existingSession.user.userId === user.userId &&
      // if the bundle is different, then we've refreshed the session
      // so we need to reset the session
      existingSession.bundle === bundle
    ) {
      return;
    }

    this.setSession({ type, user, bundle });
  };
}
