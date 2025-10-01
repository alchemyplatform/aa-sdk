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
    EventName: "account_initialized";
    EventData: {
      accountType: string;
      accountVersion: string;
    };
  },
];

export const CoreLogger = createLogger<CoreEventsSchema>({
  package: "@account-kit/core",
  version: VERSION,
});
