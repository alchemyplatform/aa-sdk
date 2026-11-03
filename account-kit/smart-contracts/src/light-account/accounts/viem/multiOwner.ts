import { getEntryPoint, type SmartAccountSigner } from "@aa-sdk/core";
import {
  createPublicClient,
  encodeFunctionData,
  hexToBigInt,
  slice,
  type Address,
  type Hex,
  type Transport,
} from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import { MultiOwnerLightAccountAbi } from "../../abis/MultiOwnerLightAccountAbi.js";
import { MultiOwnerLightAccountFactoryAbi } from "../../abis/MultiOwnerLightAccountFactoryAbi.js";
import type { LightAccountVersion } from "../../types.js";
import {
  AccountVersionRegistry,
  defaultLightAccountVersion,
  getDefaultMultiOwnerLightAccountFactoryAddress,
} from "../../utils.js";
import {
  createBaseViemLightAccount,
  type CreateBaseViemLightAccountParams,
} from "./base.js";

export type CreateViemMultiOwnerLightAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends LightAccountVersion<"MultiOwnerLightAccount"> = "v2.0.0"
> = CreateBaseViemLightAccountParams<
  "MultiOwnerLightAccount",
  TLightAccountVersion,
  TTransport,
  TSigner
> & {
  accountAddress?: Address;
  factoryAddress?: Address;
  salt?: bigint;
  initCode?: Hex;
  owners?: Address[];
};

// TODO: define the implementation and return type for multi owner light account

export function createViemMultiOwnerLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends LightAccountVersion<"MultiOwnerLightAccount"> = "v2.0.0"
>(
  params: CreateViemMultiOwnerLightAccountParams<
    TTransport,
    TSigner,
    TLightAccountVersion
  >
): Promise<SmartAccount>;

export function createViemMultiOwnerLightAccount(
  params: CreateViemMultiOwnerLightAccountParams
): Promise<SmartAccount> {
  const {
    chain,
    transport,
    signer,
    version = defaultLightAccountVersion(),
    entryPoint = getEntryPoint(chain, {
      version: AccountVersionRegistry["MultiOwnerLightAccount"][version]
        .entryPointVersion as any,
    }),
    accountAddress,
    factoryAddress = getDefaultMultiOwnerLightAccountFactoryAddress(
      chain,
      version
    ),
    salt: salt_ = 0n,
    initCode,
    owners = [],
  } = params;

  const accountAbi = MultiOwnerLightAccountAbi;
  const factoryAbi = MultiOwnerLightAccountFactoryAbi;

  const computeOwnersForInitCode = async () => {
    const ownerAddress = await signer.getAddress();
    // owners need to be dedupe + ordered in ascending order and not == to zero address
    const owners_ = Array.from(new Set([...owners, ownerAddress]))
      .filter((x) => hexToBigInt(x) !== 0n)
      .sort((a, b) => {
        const bigintA = hexToBigInt(a);
        const bigintB = hexToBigInt(b);

        return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
      });
    return owners_;
  };

  // TODO: port over the extended methods in the current impl (ie. encodeUpdateOwners and getOwnerAddresses)
  return createBaseViemLightAccount({
    abi: accountAbi,
    factoryAbi,
    chain,
    transport,
    signer,
    version,
    type: "MultiOwnerLightAccount",
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
        args: [await computeOwnersForInitCode(), salt_],
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
          args: [await computeOwnersForInitCode(), salt_],
        }),
      };
    },
  });
}
