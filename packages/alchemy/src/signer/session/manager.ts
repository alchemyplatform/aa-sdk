import { z } from "zod";
import type { AlchemySignerClient } from "../client";
import type { User } from "../client/types";
import type { Session } from "./types";

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

export class SessionManager {
  public sessionKey: string;
  private storage: Storage;
  private client: AlchemySignerClient;
  readonly expirationTimeMs: number;

  constructor(params: SessionManagerParams) {
    const { sessionKey, storage, expirationTimeMs, client } =
      SessionManagerParamsSchema.parse(params);
    this.sessionKey = sessionKey;
    this.storage = storage === "localStorage" ? localStorage : sessionStorage;
    this.expirationTimeMs = expirationTimeMs;
    this.client = client;
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

  public setSession = (
    session:
      | Omit<Extract<Session, { type: "email" }>, "expirationDateMs">
      | Omit<Extract<Session, { type: "passkey" }>, "expirationDateMs">
  ) => {
    this.storage.setItem(
      this.sessionKey,
      JSON.stringify({
        ...session,
        expirationDateMs: Date.now() + this.expirationTimeMs,
      })
    );
  };

  public clearSession = () => {
    this.storage.removeItem(this.sessionKey);
  };

  public setTemporarySession = (session: { orgId: string }) => {
    this.storage.setItem(
      `${this.sessionKey}:temporary`,
      JSON.stringify(session)
    );
  };

  public getTemporarySession = (): { orgId: string } | null => {
    const sessionStr = this.storage.getItem(`${this.sessionKey}:temporary`);

    if (!sessionStr) {
      return null;
    }

    return JSON.parse(sessionStr);
  };

  private getSession = (): Session | null => {
    const sessionStr = this.storage.getItem(this.sessionKey);

    if (!sessionStr) {
      return null;
    }

    const session = JSON.parse(sessionStr) as Session;

    /**
     * TODO: this isn't really good enough
     * A user's session could be about to expire and we would still return it
     *
     * Instead we should check if a session is about to expire and refresh it
     * We should revisit this later
     */
    if (session.expirationDateMs < Date.now()) {
      this.storage.removeItem(this.sessionKey);
      return null;
    }

    return session;
  };
}
