import { arbitrumSepolia } from "@account-kit/infra";

import { concat, numberToHex, boolToHex } from "viem";
import type { Address, Chain, Hex } from "viem";

export const DEFAULT_OWNER_ENTITY_ID = 0;

/**
 * Returns the address associated with a given chain. Throws an error if the chain is not supported.
 *
 * @param {Chain} chain The chain object containing an ID to determine the appropriate address.
 * @returns {Address} The address associated with the provided chain.
 * @throws Will throw an error if the chain is not supported.
 */ export const getDefaultSingleSignerRIAccountFactoryAddress = (
  chain: Chain
): Address => {
  switch (chain.id) {
    case 1337: // localhost
    case arbitrumSepolia.id:
      return "0xaA49939f9166c3acfA99c21612C616f81eDC52b1";
    default:
      throw new Error("6900 RI: Chain not supported");
  }
};

export type HookData = {
  data: Hex;
  hookIndex: number;
};

export type PackSignatureParams = {
  validationModule: Address;
  entityID: number;
  isGlobal: boolean;
  orderedHookData: HookData[];
  validationSignature: Hex;
};

// Signature packing utility
export const packSignature = ({
  validationModule,
  entityID,
  isGlobal,
  orderedHookData,
  validationSignature,
}: PackSignatureParams): Hex => {
  return concat([
    validationModule,
    numberToHex(entityID, { size: 4 }),
    boolToHex(isGlobal, { size: 1 }),
    ...orderedHookData.map(({ data, hookIndex }) =>
      packValidationDataWithIndex(data, hookIndex)
    ),
    packValidationDataWithIndex(
      validationSignature,
      RESERVED_VALIDATION_DATA_INDEX
    ),
  ]);
};

const packValidationDataWithIndex = (data: Hex, index: number): Hex => {
  const dataLength = (data.length - 2) / 2;
  // Content length is the length of the data + 1 byte for the index
  const contentLength = dataLength + 1;
  return concat([
    numberToHex(contentLength, { size: 4 }),
    numberToHex(index, { size: 1 }),
    data,
  ]);
};

const RESERVED_VALIDATION_DATA_INDEX = 255;
