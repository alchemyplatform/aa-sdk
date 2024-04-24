import type { User } from "../client/types";

export type Session =
  | {
      type: "email";
      bundle: string;
      expirationDateMs: number;
      user: User;
    }
  | { type: "passkey"; user: User; expirationDateMs: number };

export type SessionManagerState =
  | "CONNECTED"
  | "INITIALIZED"
  | "DISCONNECTED"
  | "AUTHENTICATING"
  | "INITIALIZING";

export type SessionManagerEvents = {
  connected(session: Session): void;
  disconnected(): void;
};
