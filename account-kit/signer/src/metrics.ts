import { createLogger } from "@account-kit/logging";
import { VERSION } from "./version.js";

export type SignerEventsSchema = [
  {
    EventName: "signer_authnticate";
    EventData:
      | {
          authType: "email" | "passkey_anon" | "passkey_email" | "oauthReturn";
          provider?: never;
        }
      | { authType: "oauth"; provider: string };
  },
  {
    EventName: "signer_sign_message";
    EventData: undefined;
  }
];

export const SignerLogger = createLogger<SignerEventsSchema>({
  package: "@account-kit/signer",
  version: VERSION,
});
