import {
  createBundlerClient,
  getEntryPoint,
  type Address,
  type EntryPointDef,
  type SmartAccountSigner,
} from "@aa-sdk/core";
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
  LightAccountEntryPointVersion,
  LightAccountVersion,
} from "../types.js";
import {
  AccountVersionRegistry,
  LightAccountUnsupported1271Factories,
  defaultLightAccountVersion,
  getDefaultLightAccountFactoryAddress,
} from "../utils.js";
import {
  createLightAccountBase,
  type CreateLightAccountBaseParams,
  type LightAccountBase,
} from "./base.js";
import { predictLightAccountAddress } from "./predictAddress.js";

export type LightAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">
> = LightAccountBase<TSigner, "LightAccount", TLightAccountVersion> & {
  encodeTransferOwnership: (newOwner: Address) => Hex;
  getOwnerAddress: () => Promise<Address>;
};

// [!region CreateLightAccountParams]
export type CreateLightAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">
> = Omit<
  CreateLightAccountBaseParams<
    "LightAccount",
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
    LightAccountEntryPointVersion<"LightAccount", TLightAccountVersion>,
    Chain
  >;
};
// [!endregion CreateLightAccountParams]

export async function createLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends LightAccountVersion<"LightAccount"> = "v2.0.0"
>(
  config: CreateLightAccountParams<TTransport, TSigner, TLightAccountVersion>
): Promise<LightAccount<TSigner, TLightAccountVersion>>;

/**
 * Creates a light account based on the provided parameters such as transport, chain, signer, init code, and more. Ensures that an account is configured and returned with various capabilities, such as transferring ownership and retrieving the owner's address.
 *
 * @example
 * ```ts
 * import { createLightAccount } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 * import { http, generatePrivateKey } from "viem"
 *
 * const account = await createLightAccount({
 *  chain: sepolia,
 *  transport: http("RPC_URL"),
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 *
 * @param {CreateLightAccountParams} config The parameters for creating a light account
 * @returns {Promise<LightAccount>} A promise that resolves to a `LightAccount` object containing the created account information and methods
 */
export async function createLightAccount({
  transport,
  chain,
  signer,
  initCode,
  version = defaultLightAccountVersion(),
  entryPoint = getEntryPoint(chain, {
    version: AccountVersionRegistry["LightAccount"][version]
      .entryPointVersion as any,
  }),
  accountAddress,
  factoryAddress = getDefaultLightAccountFactoryAddress(chain, version),
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

  const signerAddress = await signer.getAddress();

  const salt = LightAccountUnsupported1271Factories.has(
    factoryAddress.toLowerCase() as Address
  )
    ? 0n
    : salt_;

  const getAccountInitCode = async () => {
    if (initCode) return initCode;

    return concatHex([
      factoryAddress,
      encodeFunctionData({
        abi: factoryAbi,
        functionName: "createAccount",
        args: [signerAddress, salt],
      }),
    ]);
  };

  const address =
    accountAddress ??
    predictLightAccountAddress({
      factoryAddress,
      salt,
      signerAddress,
      version,
    });

  const account = await createLightAccountBase<
    "LightAccount",
    LightAccountVersion<"LightAccount">,
    Transport,
    SmartAccountSigner
  >({
    transport,
    chain,
    signer,
    abi: accountAbi,
    type: "LightAccount",
    version,
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
