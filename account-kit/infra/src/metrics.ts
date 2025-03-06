import { createLogger } from "@account-kit/logging";
import type { Address } from "viem";
import { VERSION } from "./version.js";

export type InfraEventsSchema = [
  {
    EventName: "client_send_uo";
    EventData: {
      signerType: string;
      chainId: number;
      entryPoint: Address;
    };
  }
];

export const InfraLogger = createLogger<InfraEventsSchema>({
  package: "@account-kit/infra",
  version: VERSION,
});
