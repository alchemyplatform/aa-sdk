import {
  createBundlerClient,
  getAccountAddress,
  getEntryPoint,
  toSmartContractAccount,
  type Address,
  type EntryPointParameter,
  type SmartAccountSigner,
  type SmartContractAccount,
  type SmartContractAccountWithSigner,
  type ToSmartContractAccountParams,
} from "@aa-sdk/core";
import {
  concatHex,
  encodeFunctionData,
  hexToBigInt,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import { MultisigModularAccountFactoryAbi } from "../abis/MultisigModularAccountFactory.js";
import { multisigSignMethods } from "../plugins/multisig/signer.js";
import { getDefaultMultisigModularAccountFactoryAddress } from "../utils.js";
import { standardExecutor } from "./standardExecutor.js";

export const MULTISIG_ACCOUNT_SOURCE = "MultisigModularAccount";

export type MultisigModularAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = SmartContractAccountWithSigner<
  typeof MULTISIG_ACCOUNT_SOURCE,
  TSigner,
  "0.6.0"
> & {
  getLocalThreshold: () => bigint;
};

export type CreateMultisigModularAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TEntryPointVersion extends "0.6.0" = "0.6.0",
> = Pick<
  ToSmartContractAccountParams<
    "MultisigModularAccount",
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
  threshold: bigint;
  owners?: Address[];
  accountAddress?: Address;
} & EntryPointParameter<TEntryPointVersion, Chain>;

export async function createMultisigModularAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
>(
  config: CreateMultisigModularAccountParams<TTransport, TSigner>,
): Promise<MultisigModularAccount<TSigner>>;

/**
 * Creates a multisig modular account using the provided parameters, including transport, chain, signer, account address, and other account settings. It configures the account with multiple owners and the specified threshold.
 *
 * @example
 * ```ts
 * import { createMultisigModularAccount } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 * import { http, generatePrivateKey } from "viem"
 *
 * const account = await createMultisigModularAccount({
 *  chain: sepolia,
 *  transport: http("RPC_URL"),
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
 *  owners: [...], // other owners on the account
 *  threshold: 2, // 2 of N signatures
 * });
 * ```
 *
 * @param {CreateMultisigModularAccountParams} config The parameters for creating a multisig modular account.
 * @returns {Promise<MultisigModularAccount>} A promise that resolves to a `MultisigModularAccount` object containing the created account information and methods.
 */
export async function createMultisigModularAccount(
  config: CreateMultisigModularAccountParams,
): Promise<MultisigModularAccount> {
  const {
    transport,
    chain,
    signer,
    accountAddress: accountAddress_,
    initCode,
    entryPoint = getEntryPoint(chain, { version: "0.6.0" }),
    factoryAddress = getDefaultMultisigModularAccountFactoryAddress(chain),
    owners = [],
    salt = 0n,
    threshold,
  } = config;

  const client = createBundlerClient({
    transport,
    chain,
  });

  const getAccountInitCode = async () => {
    if (initCode) {
      return initCode;
    }

    // NOTE: the current signer connected will be one of the sigs as well
    const sigAddress = await signer.getAddress();
    // sigs need to be deduped + ordered in ascending order and !== to zero address
    const sigs_ = Array.from(new Set([...owners, sigAddress]))
      .filter((x) => hexToBigInt(x) !== 0n)
      .sort((a, b) => {
        const bigintA = hexToBigInt(a);
        const bigintB = hexToBigInt(b);

        return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
      });

    return concatHex([
      factoryAddress,
      encodeFunctionData({
        abi: MultisigModularAccountFactoryAbi,
        functionName: "createAccount",
        args: [salt, sigs_, threshold],
      }),
    ]);
  };

  const accountAddress = await getAccountAddress({
    client,
    entryPoint,
    accountAddress: accountAddress_,
    getAccountInitCode,
  });

  const baseAccount = await toSmartContractAccount({
    transport,
    chain,
    entryPoint,
    accountAddress,
    source: MULTISIG_ACCOUNT_SOURCE,
    getAccountInitCode,
    ...standardExecutor,
    ...multisigSignMethods({
      client,
      accountAddress,
      threshold,
      signer: () => signer,
    }),
  });

  return {
    ...baseAccount,
    getLocalThreshold: () => threshold,
    publicKey: await signer.getAddress(),
    getSigner: () => signer,
  };
}

export const isMultisigModularAccount = (
  acct: SmartContractAccount,
): acct is MultisigModularAccount => {
  return acct.source === MULTISIG_ACCOUNT_SOURCE;
};
