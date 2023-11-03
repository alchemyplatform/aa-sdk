import type { Chain } from "viem";
import { z } from "zod";
import { getChain } from "./index.js";

export const ChainSchema = z.custom<Chain>((chain) => {
  if (
    chain == null ||
    !(typeof chain === "object") ||
    !("id" in chain) ||
    typeof chain.id !== "number"
  ) {
    return false;
  }

  try {
    return getChain(chain.id) !== undefined;
  } catch {
    return false;
  }
});
