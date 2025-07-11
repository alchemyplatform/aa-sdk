import { createLogger } from "@account-kit/logging";
import { VERSION } from "./version.js";

// TODO(jh): add wallet client events
export type CoreEventsSchema = [
  {
    EventName: "client_created";
    EventData: {};
  },
  {
    EventName: "account_initialized";
    EventData: {};
  },
];

export const Metrics = createLogger<CoreEventsSchema>({
  package: "@account-kit/walet-client",
  version: VERSION,
});
