import {
  createBundlerClient,
  getAccountAddress,
  getVersion060EntryPoint,
  toSmartContractAccount,
  type Address,
  type EntryPointDef,
  type SmartAccountSigner,
  type SmartContractAccount,
  type SmartContractAccountWithSigner,
  type UserOperationRequest,
} from "@alchemy/aa-core";
import {
  concatHex,
  encodeFunctionData,
  hexToBigInt,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import { MultisigModularAccountFactoryAbi } from "../abis/MultisigModularAccountFactory.js";
import { multisigMessageSigner } from "../plugins/multisig/signer.js";
import { getDefaultMultisigModularAccountFactoryAddress } from "../utils.js";
import { standardExecutor } from "./standardExecutor.js";

export type MultisigModularAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccountWithSigner<"MultisigModularAccount", TSigner> & {
  getLocalThreshold: () => bigint;
};

export type CreateMultisigModularAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  transport: TTransport;
  chain: Chain;
  signer: TSigner;
  salt?: bigint;
  factoryAddress?: Address;
  threshold: bigint;
  owners?: Address[];
  entryPoint?: EntryPointDef<UserOperationRequest>;
  accountAddress?: Address;
  initCode?: Hex;
};

export async function createMultisigModularAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateMultisigModularAccountParams<TTransport, TSigner>
): Promise<MultisigModularAccount<TSigner>>;

export async function createMultisigModularAccount({
  transport,
  chain,
  signer,
  accountAddress,
  initCode,
  entryPoint = getVersion060EntryPoint(chain),
  factoryAddress = getDefaultMultisigModularAccountFactoryAddress(chain),
  owners = [],
  salt = 0n,
  threshold,
}: CreateMultisigModularAccountParams): Promise<MultisigModularAccount> {
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

  accountAddress = await getAccountAddress({
    client,
    entryPointAddress: entryPoint.address,
    accountAddress: accountAddress,
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
    ...multisigMessageSigner({
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

export const MULTISIG_ACCOUNT_SOURCE = "MultisigModularAccount";

export const isMultisigModularAccount = (
  acct: SmartContractAccount
): acct is MultisigModularAccount => {
  return acct.source === MULTISIG_ACCOUNT_SOURCE;
};
