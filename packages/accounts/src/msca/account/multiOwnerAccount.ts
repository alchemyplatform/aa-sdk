import type {
  EntryPointParameter,
  SmartAccountSigner,
  SmartContractAccountWithSigner,
  ToSmartContractAccountParams,
} from "@alchemy/aa-core";
import {
  createBundlerClient,
  getAccountAddress,
  getEntryPoint,
  toSmartContractAccount,
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

export async function createMultiOwnerModularAccount({
  transport,
  chain,
  signer,
  accountAddress,
  initCode,
  entryPoint = getEntryPoint(chain, { version: "0.6.0" }),
  factoryAddress = getDefaultMultiOwnerModularAccountFactoryAddress(chain),
  owners = [],
  salt = 0n,
}: CreateMultiOwnerModularAccountParams): Promise<MultiOwnerModularAccount> {
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
