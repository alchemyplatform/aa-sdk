"use client";

import { Connection } from "@solana/web3.js";
import { createContext } from "react";

export const AlchemySolanaWeb3Context = createContext<null | {
  connection: Connection;
  policyId?: string;
}>(null);
