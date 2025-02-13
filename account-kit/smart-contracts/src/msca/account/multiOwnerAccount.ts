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
  hexToBigInt,
  type Address,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import { MultiOwnerModularAccountFactoryAbi } from "../abis/MultiOwnerModularAccountFactory.js";
import { multiOwnerMessageSigner } from "../plugins/multi-owner/signer.js";
import { getDefaultMultiOwnerModularAccountFactoryAddress } from "../utils.js";
import { standardExecutor } from "./standardExecutor.js";

export type MultiOwnerModularAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccountWithSigner<
  "MultiOwnerModularAccount",
  TSigner,
  "0.6.0"
>;

// [!region CreateMultiOwnerModularAccountParams]
export type CreateMultiOwnerModularAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TEntryPointVersion extends "0.6.0" = "0.6.0"
> = Pick<
  ToSmartContractAccountParams<
    "MultiOwnerModularAccount",
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
  owners?: Address[];
  accountAddress?: Address;
} & EntryPointParameter<TEntryPointVersion, Chain>;
// [!endregion CreateMultiOwnerModularAccountParams]

export async function createMultiOwnerModularAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateMultiOwnerModularAccountParams<TTransport, TSigner>
): Promise<MultiOwnerModularAccount<TSigner>>;

/**
 * Creates a multi-owner modular account with the given parameters, including transport, chain, signer, account address, initialization code, entry point, factory address, owners, and salt.
 * Ensures that the owners are unique, ordered, and non-zero.
 *
 * @example
 * ```ts
 * import { createMultiOwnerModularAccount } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { sepolia } from "viem/chains";
 * import { http, generatePrivateKey } from "viem"
 *
 * const account = await createMultiOwnerModularAccount({
 *  chain: sepolia,
 *  transport: http("RPC_URL"),
 *  signer: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey())
 * });
 * ```
 *
 * @param {CreateMultiOwnerModularAccountParams} config Configuration parameters for creating a multi-owner modular account
 * @returns {Promise<MultiOwnerModularAccount>} A promise that resolves to a `MultiOwnerModularAccount` object containing the created account information and methods
 */
export async function createMultiOwnerModularAccount(
  config: CreateMultiOwnerModularAccountParams
): Promise<MultiOwnerModularAccount> {
  const {
    transport,
    chain,
    signer,
    accountAddress,
    initCode,
    entryPoint = getEntryPoint(chain, { version: "0.6.0" }),
    factoryAddress = getDefaultMultiOwnerModularAccountFactoryAddress(chain),
    owners = [],
    salt = 0n,
  } = config;

  const client = createBundlerClient({
    transport,
    chain,
  });

  const getAccountInitCode = async () => {
    if (initCode) {
      return initCode;
    }

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
        abi: MultiOwnerModularAccountFactoryAbi,
        functionName: "createAccount",
        args: [salt, owners_],
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
    source: `MultiOwnerModularAccount`,
    getAccountInitCode,
    ...standardExecutor,
    ...multiOwnerMessageSigner(client, _accountAddress, () => signer),
  });

  return {
    ...baseAccount,
    publicKey: await signer.getAddress(),
    getSigner: () => signer,
  };
}
