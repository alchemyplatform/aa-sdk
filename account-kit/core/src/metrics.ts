import { createLogger } from "@account-kit/logging";
import { VERSION } from "./version.js";

export type ConfigCreatedData = {
  ssr: boolean;
  chainIds: number[];
};

export type CoreEventsSchema = [
  {
    EventName: "config_created";
    EventData: ConfigCreatedData;
  },
  {
    EventName: "signer_authnticate";
    EventData:
      | {
          authType: "email" | "passkey_anon" | "passkey_email";
        }
      | { authType: "oauth"; provider: string };
  },
  {
    EventName: "signer_sign_message";
  },
  {
    EventName: "client_send_uo";
  },
  {
    EventName: "account_initialized";
    EventData: {
      accountType: string;
      accountVersion: string;
    };
  }
];

export const CoreLogger = createLogger<CoreEventsSchema>({
  package: "@account-kit/core",
  version: VERSION,
});
