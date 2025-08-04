import { createLogger } from "@account-kit/logging";
import { VERSION } from "./version.js";
import type { StaticDecode } from "@sinclair/typebox";
import type { SerializedInitcode } from "@alchemy/wallet-api-types";

export type WalletClientMetricsSchema = [
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
  {
    EventName: "list_accounts";
  },
  {
    EventName: "prepare_sign";
  },
  {
    EventName: "format_sign";
  },
  {
    EventName: "get_calls_status";
  },
  {
    EventName: "grant_permissions";
  },
  {
    EventName: "prepare_calls";
  },
  {
    EventName: "send_prepared_calls";
    EventData: {
      type: string;
    };
  },
  {
    EventName: "sign_message";
  },
  {
    EventName: "sign_typed_data";
  },
  {
    EventName: "sign_prepared_calls";
    EventData: {
      type: string;
    };
  },
  {
    EventName: "sign_signature_request";
    EventData: {
      type: string;
    };
  },
];

export const metrics = createLogger<WalletClientMetricsSchema>({
  package: "@account-kit/wallet-client",
  version: VERSION,
});
