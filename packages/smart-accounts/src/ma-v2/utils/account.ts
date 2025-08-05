import {
  concatHex,
  encodeFunctionData,
  toHex,
  type Address,
  type Hex,
} from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import type { GetAccountParameter } from "../../types";
import type { ModuleEntity, UpgradeToData } from "../types";
import { semiModularAccountStorageAbi } from "../abis/semiModularAccountStorageAbi.js";
import type { ModularAccountV2Base } from "../accounts/base";

export const DefaultAddress = {
  MAV2_FACTORY: "0x00000000000017c61b5bEe81050EC8eFc9c6fecd",
  MAV2_FACTORY_WEBAUTHN: "0x55010E571dCf07e254994bfc88b9C1C8FAe31960",
  SMAV2_BYTECODE: "0x000000000000c5A9089039570Dd36455b5C07383",
  SMAV2_STORAGE: "0x0000000000006E2f9d80CaEc0Da6500f005EB25A",
  SMAV2_7702: "0x69007702764179f14F51cdce752f4f775d74E139",
  MAV2: "0x00000000000002377B26b1EdA7b0BC371C60DD4f", // TODO(jh): this seems unused. check w/ adam.
} satisfies Record<string, Address>;

export const DefaultModuleAddress = {
  SINGLE_SIGNER_VALIDATION: "0x00000000000099DE0BF6fA90dEB851E2A2df7d83",
  WEBAUTHN_VALIDATION: "0x0000000000001D9d34E07D9834274dF9ae575217",
  TIME_RANGE: "0x00000000000082B8e2012be914dFA4f62A0573eA",
  PAYMASTER_GUARD: "0x0000000000001aA7A7F7E29abe0be06c72FD42A1",
  NATIVE_TOKEN_LIMIT: "0x00000000000001e541f0D090868FBe24b59Fbe06",
  ALLOWLIST: "0x00000000003e826473a313e600b5b9b791f5a59a",
} satisfies Record<string, Address>;

export const DEFAULT_OWNER_ENTITY_ID = 0;

export const EXECUTE_USER_OP_SELECTOR: Hex = "0x8DD7712F";

export type GetMAV2UpgradeToData<
  TAccount extends SmartAccount | undefined = SmartAccount | undefined,
> = GetAccountParameter<TAccount>;

// TODO(v5): add jsdoc once this is finalized & tested.
export async function getMAV2UpgradeToData(
  ownerAddress: Address
): Promise<UpgradeToData> {
  const initData = encodeFunctionData({
    abi: semiModularAccountStorageAbi,
    functionName: "initialize",
    args: [ownerAddress],
  });

  return {
    implAddress: DefaultAddress.SMAV2_STORAGE,
    initializationData: initData,
    // TODO(v5): do we need `createModularAccountV2FromExisting()` in the return type here like we had in v4 or no?
  };
}

export type BuildNonceParams = {
  nonceKey?: bigint;
  entityId?: number;
  isGlobalValidation?: boolean;
  isDeferredAction?: boolean;
  isDirectCallValidation?: boolean;
};

export const buildFullNonceKey = ({
  nonceKey = 0n,
  entityId = 0,
  isGlobalValidation = true,
  isDeferredAction = false,
}: BuildNonceParams): bigint => {
  return (
    (nonceKey << 40n) +
    (BigInt(entityId) << 8n) +
    (isDeferredAction ? 2n : 0n) +
    (isGlobalValidation ? 1n : 0n)
  );
};

/**
 * Serializes a module entity into a hexadecimal format by concatenating the module address and entity ID.
 *
 * @example
 * ```ts
 * import { serializeModuleEntity } from "@account-kit/smart-contracts";
 * import { Address } from "viem";
 *
 * const moduleAddress: Address = "0x1234";
 * const entityId: number = 1234;
 *
 * const moduleEntityHex = serializeModuleEntity({
 *  moduleAddress,
 *  entityId
 * });
 * ```
 *
 * @param {ModuleEntity} config The module entity configuration containing the module address and entity ID
 * @returns {Hex} A hexadecimal string representation of the serialized module entity
 */
export function serializeModuleEntity(config: ModuleEntity): Hex {
  return concatHex([config.moduleAddress, toHex(config.entityId, { size: 4 })]);
}

export function isModularAccountV2(
  account: SmartAccount
): account is ModularAccountV2Base {
  return "source" in account && account.source === "ModularAccountV2";
}
