"use client";

import type { Connection } from "@solana/web3.js";
import { createContext } from "react";

/**
 * Context for the Alchemy Solana web3 connection.
 *
 * @example
 * ```tsx twoslash
 * import { AlchemySolanaWeb3Context } from "@account-kit/react";
 * import { Connection } from "@solana/web3.js";
 *
 * function App() {
 * const connection = new Connection("<SolanaRpcUrl>");
 *  return (
 *    <AlchemySolanaWeb3Context.Provider value={{ connection }}>
 *      <App />
 *    </AlchemySolanaWeb3Context.Provider>
 *  );
 * }
 * ```
 *
 * @param {React.PropsWithChildren<{
 *  connection: Connection;
 *  policyId?: string;
 * }>} props the props for the AlchemySolanaWeb3Context.Provider
 * @returns {React.JSX.Element} The element to wrap your application in for Alchemy Solana web3 context.
 */
export const AlchemySolanaWeb3Context = createContext<null | {
  connection: Connection;
  policyId?: string;
}>(null);
