import type { User } from "../client/types";

export type Session =
  | {
      type: "email" | "oauth" | "otp" | "custom-jwt";
      bundle: string;
      expirationDateMs: number;
      user: User;
    }
  | { type: "passkey"; user: User; expirationDateMs: number };

export type SessionManagerEvents = {
  connected(session: Session): void;
  disconnected(): void;
  initialized(): void;
};
