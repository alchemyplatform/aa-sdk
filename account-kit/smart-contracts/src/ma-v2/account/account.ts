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
  type Address,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import { accountFactoryAbi } from "../abis/accountFactoryAbi.js";
import { addresses } from "../utils.js";
import { standardExecutor } from "../../msca/account/standardExecutor.js";
import { multiOwnerMessageSigner } from "../../msca/plugins/multi-owner/signer.js"; // TODO: swap for MA v2 signer

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
    ...multiOwnerMessageSigner(
      // TODO: temp
      client,
      addresses.accountFactory,
      () => signer,
      addresses.accountFactory
    ),
  });

  return {
    ...baseAccount,
    getSigner: () => signer,
  };
}
