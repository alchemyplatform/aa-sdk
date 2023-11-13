import type { UserInfo } from "@web3auth/base";

export interface Web3AuthAuthenticationParams {
  initModal: () => Promise<void>;
  connect: () => Promise<void>;
}

export type Web3AuthUserInfo = Partial<UserInfo>;
