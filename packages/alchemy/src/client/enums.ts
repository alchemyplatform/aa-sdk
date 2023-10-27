/**
 * The following types are taken from the alchemy-sdk package, with slight modifications with viem types.
 *
 * @see: https://github.com/alchemyplatform/alchemy-sdk-js/blob/main/src/types/types.ts
 */

/** The type of call in a debug call trace. */
export enum DebugCallType {
  CREATE = "CREATE",
  CALL = "CALL",
  STATICCALL = "STATICCALL",
  DELEGATECALL = "DELEGATECALL",
}

/**
 * Authority used to decode calls and logs when using the
 * {@link simulateExecution} method.
 */
export enum DecodingAuthority {
  ETHERSCAN = "ETHERSCAN",
}
