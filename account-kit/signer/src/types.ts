import type { User } from "./client/types";

export type AlchemySignerEvents = {
  connected(user: User): void;
  disconnected(): void;
  statusChanged(status: AlchemySignerStatus): void;
};

export type AlchemySignerEvent = keyof AlchemySignerEvents;

export enum AlchemySignerStatus {
  INITIALIZING = "INITIALIZING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  AUTHENTICATING = "AUTHENTICATING",
  AWAITING_EMAIL_AUTH = "AWAITING_EMAIL_AUTH",
}
