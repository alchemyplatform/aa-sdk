import type { Address } from "viem";
import type { RequestAccountParams } from "./actions/requestAccount";

export type CachedAccount = {
  address: Address;
  requestParams: RequestAccountParams;
};

export type InternalState = {
  setAccount: (account: CachedAccount) => void;
  getAccount: () => CachedAccount | undefined;
};

export function createInternalState(): InternalState {
  let account: CachedAccount | undefined = undefined;

  return {
    setAccount: (acct) => {
      account = acct;
    },
    getAccount: () => {
      return account;
    },
  };
}
