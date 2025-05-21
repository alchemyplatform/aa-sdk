import { createLogger } from "@account-kit/logging";
import type { AlchemyAccountsUIConfig } from "./types.js";
import { VERSION } from "./version.js";

export type ReactEventsSchema = readonly [
  {
    EventName: "config_created";
    EventData: AlchemyAccountsUIConfig | { noUi: true };
  },
  {
    EventName: "add_passkey_on_signup_success";
    EventData: undefined;
  },
  {
    EventName: "add_passkey_on_signup_skip";
    EventData: undefined;
  },
  {
    EventName: "eoa_connected";
    EventData: undefined;
  },
];

export const ReactLogger = createLogger<ReactEventsSchema>({
  package: "@account-kit/react",
  version: VERSION,
});
