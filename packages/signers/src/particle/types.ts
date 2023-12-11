import { type LoginOptions, type UserInfo } from "@particle-network/auth";

export interface ParticleAuthenticationParams {
  loginOptions: LoginOptions;
  login: (loginOptions: LoginOptions) => Promise<void>;
}

export type ParticleUserInfo = UserInfo;
