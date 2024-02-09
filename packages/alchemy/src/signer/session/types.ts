import type { User } from "../client/types";

export type Session =
  | {
      type: "email";
      bundle: string;
      expirationDateMs: number;
      user: User;
    }
  | { type: "passkey"; user: User; expirationDateMs: number };
