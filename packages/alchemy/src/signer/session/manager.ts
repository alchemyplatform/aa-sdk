import EventEmitter from "eventemitter3";
import { z } from "zod";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { createStore, type Mutate, type StoreApi } from "zustand/vanilla";
import type { AlchemySignerClient } from "../client";
import type { User } from "../client/types";
import type { Session, SessionManagerEvents } from "./types";

export const DEFAULT_SESSION_MS = 15 * 60 * 1000; // 15 minutes

export const SessionManagerParamsSchema = z.object({
  sessionKey: z.string().default("alchemy-signer-session"),
  storage: z.enum(["localStorage", "sessionStorage"]).default("localStorage"),
  expirationTimeMs: z
    .number()
    .default(DEFAULT_SESSION_MS)
    .describe(
      "The time in milliseconds that a session should last before expiring [default: 15 minutes]"
    ),
  client: z.custom<AlchemySignerClient>(),
});

export type SessionManagerParams = z.input<typeof SessionManagerParamsSchema>;

type SessionState = {
  session: Session | null;
};

type Store = Mutate<
  StoreApi<SessionState>,
  [["zustand/subscribeWithSelector", never]]
>;

export class SessionManager {
  private sessionKey: string;
  private client: AlchemySignerClient;
  private eventEmitter: EventEmitter<SessionManagerEvents>;
  readonly expirationTimeMs: number;
  private store: Store;

  constructor(params: SessionManagerParams) {
    const {
      sessionKey,
      storage: storageType,
      expirationTimeMs,
      client,
    } = SessionManagerParamsSchema.parse(params);
    this.sessionKey = sessionKey;
    const storage =
      storageType === "localStorage" ? localStorage : sessionStorage;
    this.expirationTimeMs = expirationTimeMs;
    this.client = client;
    this.eventEmitter = new EventEmitter<SessionManagerEvents>();

    this.store = createStore(
      subscribeWithSelector(
        persist(
          () => {
            return {
              session: null,
            } satisfies SessionState;
          },
          {
            name: this.sessionKey,
            storage: createJSONStorage(() => storage),
          }
        )
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
      case "email": {
        const result = await this.client
          .completeEmailAuth({
            bundle: existingSession.bundle,
            orgId: existingSession.user.orgId,
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
        throw new Error("Unknown session type");
    }
  };

  public clearSession = () => {
    this.store.setState({ session: null });
  };

  public setTemporarySession = (session: { orgId: string }) => {
    // temporary session must be placed in localStorage so that it can be accessed across tabs
    localStorage.setItem(
      `${this.sessionKey}:temporary`,
      JSON.stringify(session)
    );
  };

  public getTemporarySession = (): { orgId: string } | null => {
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
      this.store.setState({ session: null });
      return null;
    }

    return session;
  };

  private setSession = (
    session:
      | Omit<Extract<Session, { type: "email" }>, "expirationDateMs">
      | Omit<Extract<Session, { type: "passkey" }>, "expirationDateMs">
  ) => {
    this.store.setState({
      session: {
        ...session,
        expirationDateMs: Date.now() + this.expirationTimeMs,
      },
    });
  };

  public initialize() {
    this.getSessionUser()
      .then((user) => {
        // once we are authenticated, then we can emit a connected event
        if (user) this.eventEmitter.emit("connected", this.getSession()!);
      })
      .finally(() => {
        this.eventEmitter.emit("initialized");
      });
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

    this.client.on("disconnected", () => this.clearSession());

    this.client.on("connectedEmail", (user, bundle) => {
      const existingSession = this.getSession();
      if (
        existingSession != null &&
        existingSession.type === "email" &&
        existingSession.user.userId === user.userId &&
        // if the bundle is different, then we've refreshed the session
        // so we need to reset the session
        existingSession.bundle === bundle
      ) {
        return;
      }

      this.setSession({ type: "email", user, bundle });
    });

    this.client.on("connectedPasskey", (user) => {
      const existingSession = this.getSession();
      if (
        existingSession != null &&
        existingSession.type === "passkey" &&
        existingSession.user.userId === user.userId
      ) {
        return;
      }

      this.setSession({ type: "passkey", user });
    });
  };
}
