import type {
  EntryPointDef,
  EntryPointDefRegistry,
  EntryPointParameter,
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
  "transport" | "chain"
> & {
  signer: TSigner;
  salt?: bigint;
  factoryAddress?: Address;
  initCode?: Hex;
  owners?: Address[];
  accountAddress?: Address;
} & EntryPointParameter<TEntryPointVersion>;

export async function createMultiOwnerModularAccount<
  TEntryPointDef extends EntryPointDefRegistry[EntryPointVersion],
  TEntryPointVersion extends EntryPointVersion = TEntryPointDef extends EntryPointDef<
    infer U
  >
    ? U
    : never,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateMultiOwnerModularAccountParams<
    TEntryPointVersion,
    TTransport,
    TSigner
  >
): Promise<MultiOwnerModularAccount<TEntryPointVersion, TSigner>>;

export async function createMultiOwnerModularAccount<
  TEntryPointDef extends EntryPointDefRegistry[EntryPointVersion],
  TEntryPointVersion extends EntryPointVersion = TEntryPointDef extends EntryPointDef<
    infer U
  >
    ? U
    : never,
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
}: CreateMultiOwnerModularAccountParams<
  TEntryPointVersion,
  TTransport,
  TSigner
>): Promise<MultiOwnerModularAccount<TEntryPointVersion, TSigner>> {
  const _entryPoint: EntryPointDef<EntryPointVersion> =
    entryPoint ?? getEntryPoint(chain);

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
    entryPoint: _entryPoint,
    accountAddress,
    getAccountInitCode,
  });

  const baseAccount =
    _entryPoint.version === "0.6.0"
      ? await toSmartContractAccount({
          transport,
          chain,
          entryPoint: _entryPoint as EntryPointDef<"0.6.0">,
          accountAddress: _accountAddress,
          source: `MultiOwnerModularAccount`,
          getAccountInitCode,
          ...standardExecutor,
          ...multiOwnerMessageSigner(client, _accountAddress, () => signer),
        })
      : _entryPoint.version === "0.7.0"
      ? await toSmartContractAccount({
          transport,
          chain,
          entryPoint: _entryPoint as EntryPointDef<"0.7.0">,
          accountAddress: _accountAddress,
          source: `MultiOwnerModularAccount`,
          getAccountInitCode,
          ...standardExecutor,
          ...multiOwnerMessageSigner(client, _accountAddress, () => signer),
        })
      : undefined;

  if (!baseAccount)
    throw new InvalidEntryPointError(chain, _entryPoint.version);

  return {
    ...baseAccount,
    publicKey: await signer.getAddress(),
    getSigner: () => signer,
  } as MultiOwnerModularAccount<TEntryPointVersion, TSigner>;
}
