import { createLogger } from "@account-kit/logging";
import { VERSION } from "./version.js";
import type { StaticDecode } from "@sinclair/typebox";
import { SerializedInitcode } from "@alchemy/wallet-api-types";

export type CoreEventsSchema = [
  {
    EventName: "client_created";
    EventData: {
      chainId: number;
    };
  },
  {
    EventName: "account_initialized";
    EventData: {
      chainId: number;
      factory: StaticDecode<typeof SerializedInitcode>["factoryType"] | "7702";
    };
  },
  // TODO(jh): add more events
];

export const metrics = createLogger<CoreEventsSchema>({
  package: "@account-kit/walet-client",
  version: VERSION,
});
