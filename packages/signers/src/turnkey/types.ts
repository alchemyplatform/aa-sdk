import type { TStamper } from "@turnkey/http/dist/base";
import type { Transport } from "viem";

export interface TurnkeyAuthParams {
  transport: Transport;
  resolveSubOrganization: () => Promise<TurnkeySubOrganization>;
}

export class TurnkeySubOrganization {
  subOrganizationId: string;
  signWith: string;
  constructor(params: { subOrganizationId: string; signWith: string }) {
    this.subOrganizationId = params.subOrganizationId;
    this.signWith = params.signWith;
  }
}

export interface TurnkeyUserMetadata {
  organizationId: string;
  organizationName: string;
  userId: string;
  username: string;
}

export type TurnkeyClientParams = {
  apiUrl: string;
  stamper: TStamper;
};
