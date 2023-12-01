import type { TStamper } from "@turnkey/http/dist/base";
import type { Transport } from "viem";

export interface TurnkeyAuthParams {
  organizationId: string;
  signWith: string;
  transport: Transport;
}

export interface TurnkeyAuthMetadata {
  organizationId: string;
  organizationName: string;
  userId: string;
  username: string;
}

export type TurnkeyClientParams = {
  apiUrl: string;
  stamper: TStamper;
};
