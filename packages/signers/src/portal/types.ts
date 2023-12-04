import type { Address } from "viem";

export interface PortalAuthenticationParams {}

export type PortalUserInfo = {
  id: string;
  address: Address;
  backupStatus?: string | null;
  custodian: {
    id: string;
    name: string;
  };
  signingStatus?: string | null;
};
