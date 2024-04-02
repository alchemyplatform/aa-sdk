import type {
  DefaultEntryPointVersion,
  EntryPointDef,
  EntryPointRegistryBase,
  EntryPointVersion,
  ToSmartContractAccountParams,
} from "@alchemy/aa-core";
import {
  InvalidEntryPointError,
  createBundlerClient,
  getAccountAddress,
  getEntryPoint,
  toSmartContractAccount,
  type Address,
  type SmartAccountSigner,
  type SmartContractAccountWithSigner,
} from "@alchemy/aa-core";
import {
  concatHex,
  encodeFunctionData,
  hexToBigInt,
  type Hex,
  type Transport,
} from "viem";
import { MultiOwnerModularAccountFactoryAbi } from "../abis/MultiOwnerModularAccountFactory.js";
import { multiOwnerMessageSigner } from "../plugins/multi-owner/signer.js";
import { getDefaultMultiOwnerModularAccountFactoryAddress } from "../utils.js";
import { standardExecutor } from "./standardExecutor.js";

export type MultiOwnerModularAccount<
  TEntryPointVersion extends EntryPointVersion,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccountWithSigner<
  TEntryPointVersion,
  "MultiOwnerModularAccount",
  TSigner
>;

export interface MultiOwnerModularAccountRegistry<
  TSigner extends SmartAccountSigner
> extends EntryPointRegistryBase<
    MultiOwnerModularAccount<EntryPointVersion, TSigner>
  > {
  "0.6.0": MultiOwnerModularAccount<"0.6.0", TSigner>;
  "0.7.0": MultiOwnerModularAccount<"0.7.0", TSigner>;
}

export type CreateMultiOwnerModularAccountParams<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Pick<
  ToSmartContractAccountParams<
    TEntryPointVersion,
    "MultiOwnerModularAccount",
    TTransport
  >,
  "transport" | "chain" | "entryPoint"
> & {
  signer: TSigner;
  salt?: bigint;
  factoryAddress?: Address;
  initCode?: Hex;
  owners?: Address[];
  accountAddress?: Address;
};

export async function createMultiOwnerModularAccount<
  TEntryPointVersion extends DefaultEntryPointVersion = DefaultEntryPointVersion,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateMultiOwnerModularAccountParams<
    TEntryPointVersion,
    TTransport,
    TSigner
  >
): Promise<MultiOwnerModularAccountRegistry<TSigner>[DefaultEntryPointVersion]>;

export async function createMultiOwnerModularAccount<
  TEntryPointDef extends EntryPointDef<TEntryPointVersion>,
  TEntryPointVersion extends EntryPointVersion = TEntryPointDef["version"],
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateMultiOwnerModularAccountParams<
    TEntryPointVersion,
    TTransport,
    TSigner
  >
): Promise<MultiOwnerModularAccountRegistry<TSigner>[TEntryPointVersion]>;

export async function createMultiOwnerModularAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>({
  chain,
  entryPoint,
  ...params
}: CreateMultiOwnerModularAccountParams<
  EntryPointVersion,
  TTransport,
  TSigner
>): Promise<MultiOwnerModularAccountRegistry<TSigner>[EntryPointVersion]> {
  const _entryPoint: EntryPointDef<EntryPointVersion> =
    entryPoint ?? getEntryPoint(chain);

  switch (_entryPoint.version) {
    case "0.6.0":
      return (await _createMultiOwnerModularAccount<"0.6.0">({
        chain,
        entryPoint: _entryPoint as EntryPointDef<"0.6.0">,
        ...params,
      })) as MultiOwnerModularAccountRegistry<TSigner>["0.6.0"];
    case "0.7.0":
      return (await _createMultiOwnerModularAccount<"0.7.0">({
        chain,
        entryPoint: _entryPoint as EntryPointDef<"0.7.0">,
        ...params,
      })) as MultiOwnerModularAccountRegistry<TSigner>["0.7.0"];
    default:
      throw new InvalidEntryPointError(chain, _entryPoint.version);
  }
}

async function _createMultiOwnerModularAccount<
  TEntryPointVersion extends EntryPointVersion,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>({
  transport,
  chain,
  signer,
  accountAddress,
  initCode,
  entryPoint,
  factoryAddress = getDefaultMultiOwnerModularAccountFactoryAddress(chain),
  owners = [],
  salt = 0n,
}: Omit<
  CreateMultiOwnerModularAccountParams<TEntryPointVersion, TTransport, TSigner>,
  "entryPoint"
> & { entryPoint: EntryPointDef<TEntryPointVersion> }): Promise<
  MultiOwnerModularAccountRegistry<TSigner>[TEntryPointVersion]
> {
  const client = createBundlerClient<TEntryPointVersion, TTransport>({
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
  } as MultiOwnerModularAccountRegistry<TSigner>[TEntryPointVersion];
}
