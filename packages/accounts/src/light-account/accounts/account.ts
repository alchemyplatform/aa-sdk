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
import { LightAccountAbi } from "../abis/LightAccountAbi.js";
import { LightAccountFactoryAbi } from "../abis/LightAccountFactoryAbi.js";
import {
  AccountVersionRegistry,
  LightAccountUnsupported1271Factories,
  defaultLightAccountVersion,
  type GetEntryPointForLightAccountVersion,
  type LightAccountVersion,
} from "../utils.js";
import {
  createLightAccountBase,
  type CreateLightAccountBaseParams,
  type LightAccountBase,
} from "./base.js";

export type LightAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
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

export type CreateLightAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
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

export async function createLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
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
  entryPoint = getEntryPoint(chain),
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
        abi: LightAccountFactoryAbi,
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
    abi: LightAccountAbi,
    version: AccountVersionRegistry["LightAccount"][version],
    entryPoint,
    accountAddress: address,
    getAccountInitCode,
  });

  return {
    ...account,

    encodeTransferOwnership: (newOwner: Address) => {
      return encodeFunctionData({
        abi: LightAccountAbi,
        functionName: "transferOwnership",
        args: [newOwner],
      });
    },
    async getOwnerAddress(): Promise<Address> {
      const callResult = await client.readContract({
        address,
        abi: LightAccountAbi,
        functionName: "owner",
      });

      if (callResult == null) {
        throw new Error("could not get on-chain owner");
      }

      return callResult;
    },
  };
}
