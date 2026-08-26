import { getEntryPoint, type SmartAccountSigner } from "@aa-sdk/core";
import {
  createPublicClient,
  encodeFunctionData,
  slice,
  type Address,
  type Hex,
  type Transport,
} from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import { LightAccountAbi_v1 } from "../../abis/LightAccountAbi_v1.js";
import { LightAccountAbi_v2 } from "../../abis/LightAccountAbi_v2.js";
import { LightAccountFactoryAbi_v1 } from "../../abis/LightAccountFactoryAbi_v1.js";
import { LightAccountFactoryAbi_v2 } from "../../abis/LightAccountFactoryAbi_v2.js";
import type { LightAccountVersion } from "../../types";
import {
  AccountVersionRegistry,
  defaultLightAccountVersion,
  getDefaultLightAccountFactoryAddress,
} from "../../utils.js";
import {
  createBaseViemLightAccount,
  type CreateBaseViemLightAccountParams,
} from "./base.js";

export type CreateViemLightAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends LightAccountVersion<"LightAccount"> = "v2.0.0"
> = CreateBaseViemLightAccountParams<
  "LightAccount",
  TLightAccountVersion,
  TTransport,
  TSigner
> & {
  accountAddress?: Address;
  factoryAddress?: Address;
  salt?: bigint;
  initCode?: Hex;
};

// TODO: define the implementation and return type for single owner light account

// TODO: the return type isn't quite correct here, we can do better following this as an example https://github.com/wevm/viem/blob/main/src/account-abstraction/accounts/implementations/toSoladySmartAccount.ts
export async function createViemLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends LightAccountVersion<"LightAccount"> = "v2.0.0"
>(
  params: CreateViemLightAccountParams<
    TTransport,
    TSigner,
    TLightAccountVersion
  >
): Promise<SmartAccount>;

export async function createViemLightAccount(
  params: CreateViemLightAccountParams
): Promise<SmartAccount> {
  const {
    chain,
    transport,
    signer,
    version = defaultLightAccountVersion(),
    entryPoint = getEntryPoint(chain, {
      version: AccountVersionRegistry["LightAccount"][version]
        .entryPointVersion as any,
    }),
    accountAddress,
    factoryAddress = getDefaultLightAccountFactoryAddress(chain, version),
    salt: salt_ = 0n,
    initCode,
  } = params;

  const accountAbi =
    version === "v2.0.0" ? LightAccountAbi_v2 : LightAccountAbi_v1;
  const factoryAbi =
    version === "v2.0.0"
      ? LightAccountFactoryAbi_v1
      : LightAccountFactoryAbi_v2;

  // TODO: port over the extended methods in the current impl (ie. encodeTransferOwnership and getOwnerAddress)
  return createBaseViemLightAccount({
    abi: accountAbi,
    factoryAbi,
    chain,
    transport,
    signer,
    version,
    type: "LightAccount",
    entryPoint,
    async getAddress() {
      if (accountAddress) return accountAddress;

      const client = createPublicClient({
        transport,
        chain,
      });

      return client.readContract({
        abi: factoryAbi,
        address: factoryAddress,
        functionName: "getAddress",
        args: [await signer.getAddress(), salt_],
      });
    },
    async getFactoryArgs() {
      if (initCode) {
        return {
          factory: slice(initCode, 0, 20),
          factoryData: slice(initCode, 20),
        };
      }

      return {
        factory: factoryAddress,
        factoryData: encodeFunctionData({
          abi: factoryAbi,
          functionName: "createAccount",
          args: [await signer.getAddress(), salt_],
        }),
      };
    },
  });
}
