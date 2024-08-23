import type { User } from "../client/types";

export type Session =
  | {
      type: "email";
      bundle: string;
      expirationDateMs: number;
      user: User;
    }
  | { type: "passkey"; user: User; expirationDateMs: number; bundle?: string };

export type SessionManagerEvents = {
  connected(session: Session): void;
  disconnected(): void;
  initialized(): void;
};
