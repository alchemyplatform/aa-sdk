"use client";

import * as solanaNetwork from "../solanaNetwork.js";
import { SolanaSigner } from "@account-kit/signer";
import { useSolanaSigner } from "./useSolanaSigner.js";
import { getSolanaConnection, watchSolanaConnection } from "@account-kit/core";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";

/**
 * Returned from the solana connection.
 */
export interface SolanaConnection {
  /** The solana signer used to send the transaction */
  readonly signer: SolanaSigner | null;
  /** The solana connection used to send the transaction */
  readonly connection: solanaNetwork.Connection | null;
}

/**
 * The parameters for the SolanaConnectionHookParams hook.
 */
export type SolanaConnectionHookParams = {
  signer?: SolanaSigner;
};

/**
 * This hook is used for establishing a connection to Solana and returns the connection object and the signer object.
 *
 * @example
 * ```ts
  const {connection} = useSolanaConnection();
 
 * ```
 * @param {SolanaConnectionHookParams} opts Options for the hook to get setup
 * @returns {SolanaConnection} The transaction hook.
 */
export function useSolanaConnection(
  opts: SolanaConnectionHookParams = {},
): SolanaConnection {
  const { config } = useAlchemyAccountContext();
  const fallbackSigner: null | SolanaSigner = useSolanaSigner();
  const connection =
    useSyncExternalStore(
      watchSolanaConnection(config),
      () => getSolanaConnection(config),
      () => getSolanaConnection(config),
    )?.connection || null;
  const signer: null | SolanaSigner = opts?.signer || fallbackSigner;

  return {
    connection,
    signer,
  };
}
