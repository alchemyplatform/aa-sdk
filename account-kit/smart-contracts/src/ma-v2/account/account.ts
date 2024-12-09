import type {
  EntryPointDef,
  SmartAccountSigner,
  SmartContractAccountWithSigner,
  ToSmartContractAccountParams,
} from "@aa-sdk/core";
import {
  createBundlerClient,
  getAccountAddress,
  getEntryPoint,
  toSmartContractAccount,
} from "@aa-sdk/core";
import {
  concatHex,
  encodeFunctionData,
  getContract,
  type Address,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import { accountFactoryAbi } from "../abis/accountFactoryAbi.js";
import { addresses } from "../utils.js";
import { standardExecutor } from "../../msca/account/standardExecutor.js";
import { singleSignerMessageSigner } from "../modules/single-signer-validation/signer.js";

export const DEFAULT_OWNER_ENTITY_ID = 0;

export type SMAV2Account<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccountWithSigner<"SMAV2Account", TSigner, "0.7.0">;

export type CreateSMAV2AccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TEntryPointVersion extends "0.7.0" = "0.7.0"
> = Pick<
  ToSmartContractAccountParams<
    "SMAV2Account",
    TTransport,
    Chain,
    TEntryPointVersion
  >,
  "transport" | "chain"
> & {
  signer: TSigner;
  salt?: bigint;
  factoryAddress?: Address;
  initCode?: Hex;
  initialOwner?: Address;
  accountAddress?: Address;
  entryPoint?: EntryPointDef<TEntryPointVersion, Chain>;
  isGlobalValidation?: boolean;
  entityId?: bigint;
};

export async function createSMAV2Account<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateSMAV2AccountParams<TTransport, TSigner>
): Promise<SMAV2Account<TSigner>>;

export async function createSMAV2Account(
  config: CreateSMAV2AccountParams
): Promise<SMAV2Account> {
  const {
    transport,
    chain,
    signer,
    salt = 0n,
    factoryAddress = addresses.accountFactory,
    initCode,
    initialOwner,
    accountAddress,
    entryPoint = getEntryPoint(chain, { version: "0.7.0" }),
    isGlobalValidation = true,
    entityId = 0n,
  } = config;

  if (entityId >= 2n ** 32n) {
    throw new Error("Entity ID must be less than uint32.max");
  }

  const client = createBundlerClient({
    transport,
    chain,
  });

  const getAccountInitCode = async () => {
    if (initCode) {
      return initCode;
    }

    // If an initial owner is not provided, use the signer's address
    const ownerAddress = initialOwner || (await signer.getAddress());

    return concatHex([
      factoryAddress,
      encodeFunctionData({
        abi: accountFactoryAbi,
        functionName: "createAccount",
        args: [ownerAddress, salt, DEFAULT_OWNER_ENTITY_ID],
      }),
    ]);
  };

  const _accountAddress = await getAccountAddress({
    client,
    entryPoint,
    accountAddress,
    getAccountInitCode,
  });

  const baseAccount = await toSmartContractAccount({
    transport,
    chain,
    entryPoint,
    accountAddress: _accountAddress,
    source: `SMAV2Account`,
    getAccountInitCode,
    ...standardExecutor,
    ...singleSignerMessageSigner(signer),
  });

  // TODO: add deferred action flag
  const getAccountNonce = async (nonceKey?: bigint): Promise<bigint> => {
    // uint32 entityId + (bytes1 options) makes a uint40
    const nonceKeySuffix: bigint =
      entityId * 256n + (isGlobalValidation ? 1n : 0n);

    if (nonceKey) {
      // comparing the end 40 bytes to suffix
      if (nonceKey % 2n ** 40n !== nonceKeySuffix) {
        throw new Error("Invalid nonceKey");
      }
    } else {
      nonceKey = nonceKeySuffix;
    }

    const entryPointContract = getContract({
      address: entryPoint.address,
      abi: entryPoint.abi,
      client,
    });

    return entryPointContract.read.getNonce([
      _accountAddress,
      nonceKey,
    ]) as Promise<bigint>;
  };

  return {
    ...baseAccount,
    getAccountNonce,
    getSigner: () => signer,
  };
}
