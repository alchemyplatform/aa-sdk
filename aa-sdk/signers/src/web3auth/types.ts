import type { UserInfo } from "@web3auth/base";

export interface Web3AuthAuthenticationParams {
  init: () => Promise<void>;
  connect: () => Promise<void>;
}

export type Web3AuthUserInfo = Partial<UserInfo>;
