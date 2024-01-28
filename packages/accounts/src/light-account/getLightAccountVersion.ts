import type { SmartContractAccount } from "@alchemy/aa-core";
import { fromHex, type Address } from "viem";
import { LightAccountVersions, type LightAccountVersion } from "./utils.js";

export const getLightAccountVersion = async <A extends SmartContractAccount>(
  account: A
) => {
  const implAddress = await account.getImplementationAddress();
  const implToVersion = new Map(
    Object.entries(LightAccountVersions).map(([key, value]) => [
      value.implAddress,
      key as LightAccountVersion,
    ])
  );

  const factoryToVersion = new Map(
    Object.entries(LightAccountVersions).map(([key, value]) => [
      value.factoryAddress,
      key as LightAccountVersion,
    ])
  );

  const version =
    fromHex(implAddress, "bigint") === 0n
      ? factoryToVersion.get(
          account.getFactoryAddress().toLowerCase() as Address
        )
      : implToVersion.get(implAddress.toLowerCase() as Address);

  if (!version) {
    throw new Error("Could not determine LightAccount version");
  }

  return version;
};
