import {
  createBundlerClient,
  getEntryPoint,
  type EntryPointDef,
  type SmartAccountSigner,
} from "@aa-sdk/core";
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
  LightAccountEntryPointVersion,
  LightAccountVersion,
} from "../types.js";
import {
  defaultLightAccountVersion,
  getDefaultMultiOwnerLightAccountFactoryAddress,
} from "../utils.js";
import {
  createLightAccountBase,
  type CreateLightAccountBaseParams,
  type LightAccountBase,
} from "./base.js";
import { predictMultiOwnerLightAccountAddress } from "./predictAddress.js";

export type MultiOwnerLightAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends
    LightAccountVersion<"MultiOwnerLightAccount"> = LightAccountVersion<"MultiOwnerLightAccount">,
> = LightAccountBase<
  TSigner,
  "MultiOwnerLightAccount",
  TLightAccountVersion
> & {
  encodeUpdateOwners: (
    ownersToAdd: Address[],
    ownersToRemove: Address[],
  ) => Hex;
  getOwnerAddresses: () => Promise<readonly Address[]>;
};

export type CreateMultiOwnerLightAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends
    LightAccountVersion<"MultiOwnerLightAccount"> = LightAccountVersion<"MultiOwnerLightAccount">,
> = Omit<
  CreateLightAccountBaseParams<
    "MultiOwnerLightAccount",
    TLightAccountVersion,
    TTransport,
    TSigner
  >,
  | "getAccountInitCode"
  | "entryPoint"
  | "version"
  | "abi"
  | "accountAddress"
  | "type"
> & {
  salt?: bigint;
  initCode?: Hex;
  accountAddress?: Address;
  factoryAddress?: Address;
  version?: TLightAccountVersion;
  entryPoint?: EntryPointDef<
    LightAccountEntryPointVersion<
      "MultiOwnerLightAccount",
      TLightAccountVersion
    >,
    Chain
  >;
  owners?: Address[];
};

export async function createMultiOwnerLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends
    LightAccountVersion<"MultiOwnerLightAccount"> = LightAccountVersion<"MultiOwnerLightAccount">,
>(
  config: CreateMultiOwnerLightAccountParams<
    TTransport,
    TSigner,
    TLightAccountVersion
  >,
): Promise<MultiOwnerLightAccount<TSigner, TLightAccountVersion>>;

/**
 * Creates a multi-owner light account using the provided parameters, including transport, chain, signer, initialization code, version, account address, factory address, salt, and owners. Ensures the owners list is deduplicated, ordered, and valid.
 *
 * @example
 * ```ts
 * import { createMultiOwnerLightAccount } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 * import { http, generatePrivateKey } from "viem"
 *
 * const account = await createMultiOwnerLightAccount({
 *  chain: sepolia,
 *  transport: http("RPC_URL"),
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 *
 * @param {CreateMultiOwnerLightAccountParams} config The parameters for creating a multi-owner light account
 * @returns {Promise<MultiOwnerLightAccount>} A promise that resolves to a `MultiOwnerLightAccount` object containing the created account information and methods
 */
export async function createMultiOwnerLightAccount({
  transport,
  chain,
  signer,
  initCode,
  version = defaultLightAccountVersion(),
  entryPoint = getEntryPoint(chain, {
    version: "0.7.0",
  }),
  accountAddress,
  factoryAddress = getDefaultMultiOwnerLightAccountFactoryAddress(
    chain,
    version,
  ),
  salt: salt_ = 0n,
  owners = [],
}: CreateMultiOwnerLightAccountParams): Promise<MultiOwnerLightAccount> {
  const client = createBundlerClient({
    transport,
    chain,
  });

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

  const getAccountInitCode = async () => {
    if (initCode) return initCode;

    return concatHex([
      factoryAddress,
      encodeFunctionData({
        abi: MultiOwnerLightAccountFactoryAbi,
        functionName: "createAccount",
        args: [owners_, salt_],
      }),
    ]);
  };

  const address =
    accountAddress ??
    predictMultiOwnerLightAccountAddress({
      factoryAddress,
      salt: salt_,
      ownerAddresses: owners_,
    });

  const account = await createLightAccountBase<
    "MultiOwnerLightAccount",
    LightAccountVersion<"MultiOwnerLightAccount">,
    Transport,
    SmartAccountSigner
  >({
    transport,
    chain,
    signer,
    abi: MultiOwnerLightAccountAbi,
    version,
    type: "MultiOwnerLightAccount",
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
