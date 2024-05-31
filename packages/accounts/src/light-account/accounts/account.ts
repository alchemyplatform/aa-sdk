import {
  createBundlerClient,
  getAccountAddress,
  getEntryPoint,
  type Address,
  type EntryPointDef,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import {
  concatHex,
  encodeFunctionData,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import { LightAccountAbi_v1 } from "../abis/LightAccountAbi_v1.js";
import { LightAccountAbi_v2 } from "../abis/LightAccountAbi_v2.js";
import { LightAccountFactoryAbi_v1 } from "../abis/LightAccountFactoryAbi_v1.js";
import { LightAccountFactoryAbi_v2 } from "../abis/LightAccountFactoryAbi_v2.js";
import type {
  GetEntryPointForLightAccountVersion,
  GetLightAccountVersion,
} from "../types.js";
import {
  AccountVersionRegistry,
  LightAccountUnsupported1271Factories,
  defaultLightAccountVersion,
} from "../utils.js";
import {
  createLightAccountBase,
  type CreateLightAccountBaseParams,
  type LightAccountBase,
} from "./base.js";

export type LightAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends GetLightAccountVersion<"LightAccount"> = GetLightAccountVersion<"LightAccount">,
  TEntryPointVersion extends GetEntryPointForLightAccountVersion<
    "LightAccount",
    TLightAccountVersion
  > = GetEntryPointForLightAccountVersion<"LightAccount", TLightAccountVersion>
> = LightAccountBase<
  TSigner,
  "LightAccount",
  TLightAccountVersion,
  TEntryPointVersion
> & {
  encodeTransferOwnership: (newOwner: Address) => Hex;
  getOwnerAddress: () => Promise<Address>;
};

// [!region CreateLightAccountParams]
export type CreateLightAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends GetLightAccountVersion<"LightAccount"> = GetLightAccountVersion<"LightAccount">,
  TEntryPointVersion extends GetEntryPointForLightAccountVersion<
    "LightAccount",
    TLightAccountVersion
  > = GetEntryPointForLightAccountVersion<"LightAccount", TLightAccountVersion>
> = Omit<
  CreateLightAccountBaseParams<
    TTransport,
    TSigner,
    "LightAccount",
    TLightAccountVersion,
    TEntryPointVersion
  >,
  "getAccountInitCode" | "entryPoint" | "version" | "abi" | "accountAddress"
> & {
  salt?: bigint;
  initCode?: Hex;
  accountAddress?: Address;
  factoryAddress?: Address;
  version?: TLightAccountVersion;
  entryPoint?: EntryPointDef<TEntryPointVersion, Chain>;
};
// [!endregion CreateLightAccountParams]

export async function createLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends GetLightAccountVersion<"LightAccount"> = "v1.1.0"
>(
  config: CreateLightAccountParams<TTransport, TSigner, TLightAccountVersion>
): Promise<LightAccount<TSigner, TLightAccountVersion>>;

export async function createLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends GetLightAccountVersion<"LightAccount"> = GetLightAccountVersion<"LightAccount">,
  TEntryPointVersion extends GetEntryPointForLightAccountVersion<
    "LightAccount",
    TLightAccountVersion
  > = GetEntryPointForLightAccountVersion<"LightAccount", TLightAccountVersion>
>(
  config: CreateLightAccountParams<
    TTransport,
    TSigner,
    TLightAccountVersion,
    TEntryPointVersion
  >
): Promise<LightAccount<TSigner, TLightAccountVersion, TEntryPointVersion>>;

export async function createLightAccount({
  transport,
  chain,
  signer,
  initCode,
  version = defaultLightAccountVersion("LightAccount"),
  entryPoint = getEntryPoint(chain, {
    version: AccountVersionRegistry["LightAccount"][version]
      .entryPointVersion as any,
  }),
  accountAddress,
  factoryAddress = AccountVersionRegistry["LightAccount"][version].address[
    chain.id
  ].factory,
  salt: salt_ = 0n,
}: CreateLightAccountParams): Promise<LightAccount> {
  const client = createBundlerClient({
    transport,
    chain,
  });

  const accountAbi =
    version === "v2.0.0" ? LightAccountAbi_v2 : LightAccountAbi_v1;
  const factoryAbi =
    version === "v2.0.0"
      ? LightAccountFactoryAbi_v1
      : LightAccountFactoryAbi_v2;

  const getAccountInitCode = async () => {
    if (initCode) return initCode;

    const salt = LightAccountUnsupported1271Factories.has(
      factoryAddress.toLowerCase() as Address
    )
      ? 0n
      : salt_;

    return concatHex([
      factoryAddress,
      encodeFunctionData({
        abi: factoryAbi,
        functionName: "createAccount",
        args: [await signer.getAddress(), salt],
      }),
    ]);
  };

  const address = await getAccountAddress({
    client,
    entryPoint,
    accountAddress,
    getAccountInitCode,
  });

  const account = await createLightAccountBase<
    Transport,
    SmartAccountSigner,
    "LightAccount"
  >({
    transport,
    chain,
    signer,
    abi: accountAbi,
    version: AccountVersionRegistry["LightAccount"][version],
    entryPoint,
    accountAddress: address,
    getAccountInitCode,
  });

  return {
    ...account,

    encodeTransferOwnership: (newOwner: Address) => {
      return encodeFunctionData({
        abi: accountAbi,
        functionName: "transferOwnership",
        args: [newOwner],
      });
    },
    async getOwnerAddress(): Promise<Address> {
      const callResult = await client.readContract({
        address,
        abi: accountAbi,
        functionName: "owner",
      });

      if (callResult == null) {
        throw new Error("could not get on-chain owner");
      }

      return callResult;
    },
  };
}
