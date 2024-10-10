import type { User } from "./client/types";

export type AlchemySignerEvents = {
  connected(user: User): void;
  disconnected(): void;
  statusChanged(status: AlchemySignerStatus): void;
  errorChanged(error: ErrorInfo | undefined): void;
};

export type AlchemySignerEvent = keyof AlchemySignerEvents;

export enum AlchemySignerStatus {
  INITIALIZING = "INITIALIZING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  AUTHENTICATING_PASSKEY = "AUTHENTICATING_PASSKEY",
  AUTHENTICATING_EMAIL = "AUTHENTICATING_EMAIL",
  AUTHENTICATING_OAUTH = "AUTHENTICATING_OAUTH",
  AWAITING_EMAIL_AUTH = "AWAITING_EMAIL_AUTH",
}

export interface ErrorInfo {
  name: string;
  message: string;
}
