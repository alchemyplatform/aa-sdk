import { createLogger } from "@account-kit/logging";
import { VERSION } from "./version.js";

export type InfraEventsSchema = [
  {
    EventName: "client_send_uo";
    EventData: {
      signer_type: string;
    };
  }
];

export const InfraLogger = createLogger<InfraEventsSchema>({
  package: "@account-kit/infra",
  version: VERSION,
});
