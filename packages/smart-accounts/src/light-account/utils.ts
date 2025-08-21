import { BaseError, ChainNotFoundError, lowerAddress } from "@alchemy/common";
import { hexToNumber, trim, type Address } from "viem";
import { getStorageAt } from "viem/actions";
import { getAction } from "viem/utils";
import type { LightAccountBase } from "./accounts/base.js";
import type { LightAccountType, LightAccountVersion } from "./registry.js";
import { AccountVersionRegistry } from "./registry.js";

// TODO(v5): The pattern of getDefaultXYZAddress(…) doesn’t really make sense as a standalone.
// We built this expecting lots of diverging addresses per chain, but in practice we have none
// (and we’ve turned down things that require this). Instead: we could build the
// default-but-overridable behavior into the consuming functions themselves (i.e.
// createLightAccount defaulting to a factory address, but make it overridable)

/**
 * Get the default light account version for the given light account type
 *
 * @template {LightAccountType} TLightAccountType
 * @returns {LightAccountVersion<TLightAccountType>} the default version for the given light account type
 */
export const defaultLightAccountVersion = <
  TLightAccountType extends LightAccountType,
>(): LightAccountVersion<TLightAccountType> => "v2.0.0";

/**
 * Can be used to check if the account with one of the following implementation addresses
 * to not support 1271 signing.
 *
 * Light accounts with versions v1.0.1 and v1.0.2 do not support 1271 signing.
 */
export const LightAccountUnsupported1271Impls = [
  AccountVersionRegistry.LightAccount["v1.0.1"],
  AccountVersionRegistry.LightAccount["v1.0.2"],
];

/**
 * Can be used to check if the account with one of the following factory addresses
 * to not support 1271 signing.
 *
 * Light accounts with versions v1.0.1 and v1.0.2 do not support 1271 signing.
 */
export const LightAccountUnsupported1271Factories = new Set(
  LightAccountUnsupported1271Impls.map((x) => [x.factoryAddress]).flat(),
);

export const EIP1967_PROXY_IMPL_STORAGE_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

/**
 * Get the light account implementation address for the given light account
 *
 * @param {LightAccountBase} account - the light account to get the implementation address for
 * @returns {Promise<Address>} the light account implementation address for the given light account
 */
export async function getLightAccountImplAddress<
  TAccount extends LightAccountBase,
>(account: TAccount): Promise<Address> {
  const client = account.client;
  const chain = client.chain;
  if (!chain) {
    throw new ChainNotFoundError();
  }
  const version = account.getLightAccountVersion();
  const type = account.source;

  const expectedImplAddresses = Object.values(AccountVersionRegistry[type]).map(
    (x) => x.accountImplementation,
  );

  const getStorageAtAction = getAction(client, getStorageAt, "getStorageAt");

  const storage = await getStorageAtAction({
    address: account.address,
    slot: EIP1967_PROXY_IMPL_STORAGE_SLOT,
  });

  if (storage == null) {
    throw new BaseError(
      `Failed to get storage slot: ${EIP1967_PROXY_IMPL_STORAGE_SLOT}`,
    );
  }

  if (
    hexToNumber(storage) !== 0 &&
    !expectedImplAddresses.some((x) => x === lowerAddress(trim(storage)))
  ) {
    throw new BaseError(
      `could not determine if smart account implementation is ${type} ${String(
        version,
      )}`,
    );
  }

  return trim(storage);
}
