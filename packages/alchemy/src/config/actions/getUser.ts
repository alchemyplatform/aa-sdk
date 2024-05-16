import type { AlchemyAccountsConfig } from "../types";

export const getUser = (config: AlchemyAccountsConfig) => {
  const user = config.clientStore.getState().user;
  if (user == null) return user;

  return {
    ...user,
    type: "sca" as const,
  };
};
