import { arbitrumSepolia } from "@account-kit/infra";

import type { Address, Chain } from "viem";

export const DEFAULT_OWNER_ENTITY_ID = 0;

export const getDefaultRIAccountFactoryAddress = (chain: Chain): Address => {
  switch (chain.id) {
    case arbitrumSepolia.id:
      return "0x1c7EF41AA9896b74223a3956c7dDE28F206E8b24";
    default:
      throw new Error("6900 RI: Chain not supported");
  }
};
