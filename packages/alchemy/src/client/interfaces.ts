/**
 * The following types are taken from the alchemy-sdk package, with slight modifications with viem types.
 *
 * @see: https://github.com/alchemyplatform/alchemy-sdk-js/blob/main/src/types/types.ts
 */

import type { DebugCallType, DecodingAuthority } from "./enums";

/**
 * Transaction object used in {@link simulateExecution}.
 */
export interface DebugTransaction {
  /** The address the transaction is directed to. */
  to?: string;
  /** The address the transaction is sent from. */
  from?: string;
  /** The gas provided for the transaction execution, as a hex string. */
  gas?: string;
  /** The gas price to use as a hex string. */
  gasPrice?: string;
  /** The value associated with the transaction as a hex string. */
  value?: string;
  /** The data associated with the transaction. */
  data?: string;
}

/** The input or output parameters from a {@link DecodedDebugCallTrace}. */
export interface DecodedCallParam {
  /** Value of the parameter. */
  value: string;
  /** The name of the parameter. */
  name: string;
  /** The type of the parameter.*/
  type: string;
}

/** The input parameters from a {@link DecodedLog}. */
export interface DecodedLogInput extends DecodedCallParam {
  /** Whether the log is marked as indexed in the smart contract. */
  indexed: boolean;
}

/**
 * Decoded representation of the call trace that is part of a
 * {@link SimulationCallTrace}.
 */
export interface DecodedDebugCallTrace {
  /** The smart contract method called. */
  methodName: string;
  /** Method inputs. */
  inputs: DecodedCallParam[];
  /** Method outputs. */
  outputs: DecodedCallParam[];
  /** The source used to provide the decoded call trace. */
  authority: DecodingAuthority;
}

/**
 * Debug call trace in a {@link SimulateExecutionResponse}.
 */
export interface SimulationCallTrace
  extends Omit<DebugCallTrace, "revertReason" | "calls"> {
  /** The type of call. */
  type: DebugCallType;
  /** A decoded version of the call. Provided on a best-effort basis. */
  decoded?: DecodedDebugCallTrace;
}

/**
 * Decoded representation of the debug log that is part of a
 * {@link SimulationDebugLog}.
 */

export interface DecodedLog {
  /** The decoded name of the log event. */
  eventName: string;
  /** The decoded inputs to the log. */
  inputs: DecodedLogInput[];
  /** The source used to provide the decoded log. */
  authority: DecodingAuthority;
}

/**
 * Debug log in a {@link SimulateExecutionResponse}.
 */
export interface SimulationDebugLog {
  /** An array of topics in the log. */
  topics: string[];
  /** The address of the contract that generated the log. */
  address: string;
  /** The data included the log. */
  data: string;
  /** A decoded version of the log. Provided on a best-effort basis. */
  decoded?: DecodedLog;
}

/** Response object for the {@link TransactNamespace.simulateExecution} method. */
export interface SimulateExecutionResponse {
  /**
   * An array of traces generated during simulation that represent the execution
   * of the transaction along with the decoded calls if available.
   */
  calls: SimulationCallTrace[];

  /**
   * An array of logs emitted during simulation along with the decoded logs if
   * available.
   */
  logs: SimulationDebugLog[];
}

/**
 * Debug result returned when using a {@link DebugCallTracer}.
 */
export interface DebugCallTrace {
  /** The type of call: `CALL` or `CREATE` for the top-level call. */
  type: string;
  /** From address of the transaction. */
  from: string;
  /** To address of the transaction. */
  to: string;
  /** Amount of value transfer as a hex string. */
  value: string;
  /** Gas provided for call as a hex string. */
  gas: string;
  /** Gas used during the call as a hex string. */
  gasUsed: string;
  /** Call data. */
  input: string;
  /** Return data. */
  output: string;
  /** Optional error field. */
  error?: string;
  /** Solidity revert reason, if the call reverted. */
  revertReason?: string;
  /** Array of sub-calls executed as part of the original call. */
  calls?: DebugCallTrace[];
}
