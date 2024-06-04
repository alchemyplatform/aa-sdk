import {
  createBundlerClient,
  getAccountAddress,
  getEntryPoint,
  type EntryPointDef,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import {
  concatHex,
  encodeFunctionData,
  hexToBigInt,
  type Address,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import { MultiOwnerLightAccountAbi } from "../abis/MultiOwnerLightAccountAbi.js";
import { MultiOwnerLightAccountFactoryAbi } from "../abis/MultiOwnerLightAccountFactoryAbi.js";
import type {
  GetEntryPointForLightAccountVersion,
  GetLightAccountVersion,
} from "../types.js";
import {
  AccountVersionRegistry,
  defaultLightAccountVersion,
} from "../utils.js";
import {
  createLightAccountBase,
  type CreateLightAccountBaseParams,
  type LightAccountBase,
} from "./base.js";

export type MultiOwnerLightAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends GetLightAccountVersion<"MultiOwnerLightAccount"> = GetLightAccountVersion<"MultiOwnerLightAccount">,
  TEntryPointVersion extends GetEntryPointForLightAccountVersion<
    "MultiOwnerLightAccount",
    TLightAccountVersion
  > = GetEntryPointForLightAccountVersion<
    "MultiOwnerLightAccount",
    TLightAccountVersion
  >
> = LightAccountBase<
  TSigner,
  "MultiOwnerLightAccount",
  TLightAccountVersion,
  TEntryPointVersion
> & {
  encodeUpdateOwners: (
    ownersToAdd: Address[],
    ownersToRemove: Address[]
  ) => Hex;
  getOwnerAddresses: () => Promise<readonly Address[]>;
};

export type CreateMultiOwnerLightAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends GetLightAccountVersion<"MultiOwnerLightAccount"> = GetLightAccountVersion<"MultiOwnerLightAccount">,
  TEntryPointVersion extends GetEntryPointForLightAccountVersion<
    "MultiOwnerLightAccount",
    TLightAccountVersion
  > = GetEntryPointForLightAccountVersion<
    "MultiOwnerLightAccount",
    TLightAccountVersion
  >
> = Omit<
  CreateLightAccountBaseParams<
    TTransport,
    TSigner,
    "MultiOwnerLightAccount",
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
  owners?: Address[];
};

export async function createMultiOwnerLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends GetLightAccountVersion<"MultiOwnerLightAccount"> = GetLightAccountVersion<"MultiOwnerLightAccount">,
  TEntryPointVersion extends GetEntryPointForLightAccountVersion<
    "MultiOwnerLightAccount",
    TLightAccountVersion
  > = GetEntryPointForLightAccountVersion<
    "MultiOwnerLightAccount",
    TLightAccountVersion
  >
>(
  config: CreateMultiOwnerLightAccountParams<
    TTransport,
    TSigner,
    TLightAccountVersion,
    TEntryPointVersion
  >
): Promise<
  MultiOwnerLightAccount<TSigner, TLightAccountVersion, TEntryPointVersion>
>;

export async function createMultiOwnerLightAccount({
  transport,
  chain,
  signer,
  initCode,
  version = defaultLightAccountVersion("MultiOwnerLightAccount"),
  entryPoint = getEntryPoint(chain, {
    version:
      AccountVersionRegistry["MultiOwnerLightAccount"][version]
        .entryPointVersion,
  }),
  accountAddress,
  factoryAddress = AccountVersionRegistry["MultiOwnerLightAccount"][version]
    .address[chain.id].factory,
  salt: salt_ = 0n,
  owners = [],
}: CreateMultiOwnerLightAccountParams): Promise<MultiOwnerLightAccount> {
  const client = createBundlerClient({
    transport,
    chain,
  });

  const getAccountInitCode = async () => {
    if (initCode) return initCode;

    // NOTE: the current signer connected will be one of the owners as well
    const ownerAddress = await signer.getAddress();
    // owners need to be dedupe + ordered in ascending order and not == to zero address
    const owners_ = Array.from(new Set([...owners, ownerAddress]))
      .filter((x) => hexToBigInt(x) !== 0n)
      .sort((a, b) => {
        const bigintA = hexToBigInt(a);
        const bigintB = hexToBigInt(b);

        return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
      });

    return concatHex([
      factoryAddress,
      encodeFunctionData({
        abi: MultiOwnerLightAccountFactoryAbi,
        functionName: "createAccount",
        args: [owners_, salt_],
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
    "MultiOwnerLightAccount"
  >({
    transport,
    chain,
    signer,
    abi: MultiOwnerLightAccountAbi,
    version: AccountVersionRegistry["MultiOwnerLightAccount"][version],
    entryPoint,
    accountAddress: address,
    getAccountInitCode,
  });

  return {
    ...account,
    encodeUpdateOwners: (ownersToAdd: Address[], ownersToRemove: Address[]) => {
      return encodeFunctionData({
        abi: MultiOwnerLightAccountAbi,
        functionName: "updateOwners",
        args: [ownersToAdd, ownersToRemove],
      });
    },
    async getOwnerAddresses(): Promise<readonly Address[]> {
      const callResult = await client.readContract({
        address,
        abi: MultiOwnerLightAccountAbi,
        functionName: "owners",
      });

      if (callResult == null) {
        throw new Error("could not get on-chain owners");
      }

      if (!callResult.includes(await signer.getAddress())) {
        throw new Error("on-chain owners does not include the current signer");
      }

      return callResult;
    },
  };
}
