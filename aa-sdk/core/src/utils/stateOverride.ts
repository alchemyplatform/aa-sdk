import type { Address } from "abitype";
import {
  AccountStateConflictError,
  InvalidAddressError,
  StateAssignmentConflictError,
  isAddress,
  numberToHex,
  type RpcAccountStateOverride,
  type RpcStateMapping,
  type RpcStateOverride,
  type StateMapping,
  type StateOverride,
} from "viem";

// Copied from Viem's utils/stateOverride.ts, which does not expose these
// functions.

type SerializeStateMappingParameters = StateMapping | undefined;

function serializeStateMapping(
  stateMapping: SerializeStateMappingParameters
): RpcStateMapping | undefined {
  if (!stateMapping || stateMapping.length === 0) return undefined;
  return stateMapping.reduce((acc, { slot, value }) => {
    validateBytes32HexLength(slot);
    validateBytes32HexLength(value);
    acc[slot] = value;
    return acc;
  }, {} as RpcStateMapping);
}

function validateBytes32HexLength(value: Address): void {
  if (value.length !== 66) {
    // This is the error message from Viem's non-exported InvalidBytesLengthError.
    throw new Error(
      `Hex is expected to be 66 hex long, but is ${value.length} hex long.`
    );
  }
}

type SerializeAccountStateOverrideParameters = Omit<
  StateOverride[number],
  "address"
>;

function serializeAccountStateOverride(
  parameters: SerializeAccountStateOverrideParameters
): RpcAccountStateOverride {
  const { balance, nonce, state, stateDiff, code } = parameters;
  const rpcAccountStateOverride: RpcAccountStateOverride = {};
  if (code !== undefined) rpcAccountStateOverride.code = code;
  if (balance !== undefined)
    rpcAccountStateOverride.balance = numberToHex(balance);
  if (nonce !== undefined) rpcAccountStateOverride.nonce = numberToHex(nonce);
  if (state !== undefined)
    rpcAccountStateOverride.state = serializeStateMapping(state);
  if (stateDiff !== undefined) {
    if (rpcAccountStateOverride.state) throw new StateAssignmentConflictError();
    rpcAccountStateOverride.stateDiff = serializeStateMapping(stateDiff);
  }
  return rpcAccountStateOverride;
}

type SerializeStateOverrideParameters = StateOverride | undefined;

// eslint-disable-next-line jsdoc/require-jsdoc
export function serializeStateOverride(
  parameters?: SerializeStateOverrideParameters
): RpcStateOverride | undefined {
  if (!parameters) return undefined;
  const rpcStateOverride: RpcStateOverride = {};
  for (const { address, ...accountState } of parameters) {
    if (!isAddress(address, { strict: false }))
      throw new InvalidAddressError({ address });
    if (rpcStateOverride[address])
      throw new AccountStateConflictError({ address: address });
    rpcStateOverride[address] = serializeAccountStateOverride(accountState);
  }
  return rpcStateOverride;
}
