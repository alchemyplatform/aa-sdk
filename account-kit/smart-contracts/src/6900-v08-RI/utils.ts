import { arbitrumSepolia } from "@account-kit/infra";

import type { Address, Chain } from "viem";

export const getDefaultRIAccountFactoryAddress = (chain: Chain): Address => {
  switch (chain.id) {
    case arbitrumSepolia.id:
      // TODO: Add the correct address for each chain
      return "0x0000000000000000000000000000000000000000";
    default:
      throw new Error("6900 RI: Chain not supported");
  }
};
