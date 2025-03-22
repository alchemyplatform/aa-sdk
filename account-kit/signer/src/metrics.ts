import { createLogger } from "@account-kit/logging";
import { VERSION } from "./version.js";

export type SignerEventsSchema = [
  {
    EventName: "signer_authnticate";
    EventData:
      | {
          authType:
            | "email"
            | "passkey_anon"
            | "passkey_email"
            | "otp"
            | "oauthReturn";
          provider?: never;
        }
      | { authType: "oauth"; provider: string }
      | { authType: "custom-jwt"; provider: string };
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
