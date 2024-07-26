import type {
  EntryPointParameter,
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
  type Address,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import { AccountFactoryAbi } from "../abis/AccountFactory.js";
import {
  getDefaultRIAccountFactoryAddress,
  DEFAULT_OWNER_ENTITY_ID,
} from "../utils.js";
import { executor } from "../actions/execute.js";
import { singleSignerMessageSigner } from "../modules/single-signer-validation/signer.js";

export type SingleOwnerRIAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccountWithSigner<"SingleOwnerRIAccount", TSigner, "0.7.0">;

export type CreateSingleOwnerRIAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TEntryPointVersion extends "0.7.0" = "0.7.0"
> = Pick<
  ToSmartContractAccountParams<
    "SingleOwnerRIAccount",
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
} & EntryPointParameter<TEntryPointVersion, Chain>;

export async function createSingleOwnerRIAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateSingleOwnerRIAccountParams<TTransport, TSigner>
): Promise<SingleOwnerRIAccount<TSigner>>;

export async function createSingleOwnerRIAccount(
  config: CreateSingleOwnerRIAccountParams
): Promise<SingleOwnerRIAccount> {
  const {
    transport,
    chain,
    signer,
    salt = 0n,
    factoryAddress = getDefaultRIAccountFactoryAddress(chain),
    initCode,
    initialOwner,
    accountAddress,
    entryPoint = getEntryPoint(chain, { version: "0.7.0" }),
  } = config;

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
        abi: AccountFactoryAbi,
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
    source: `SingleOwnerRIAccount`,
    getAccountInitCode,
    ...executor,
    ...singleSignerMessageSigner(signer),
  });

  return {
    ...baseAccount,
    getSigner: () => signer,
  };
}
