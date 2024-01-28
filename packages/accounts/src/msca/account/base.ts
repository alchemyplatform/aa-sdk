import {
  getAccountAddress,
  getDefaultEntryPointAddress,
  toSmartContractAccount,
  type Address,
  type OwnedSmartContractAccount,
  type PublicErc4337Client,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import {
  concatHex,
  encodeFunctionData,
  hexToBigInt,
  type Hex,
  type Transport,
} from "viem";
import { IStandardExecutorAbi } from "../abis/IStandardExecutor.js";
import { MultiOwnerMSCAFactoryAbi } from "../abis/MultiOwnerMSCAFactory.js";
import { MultiOwnerTokenReceiverMSCAFactoryAbi } from "../abis/MultiOwnerTokenReceiverMSCAFactory.js";
import { multiOwnerMessageSigner } from "../plugins/multi-owner/signer.js";
import { getDefaultMultiOwnerMSCAFactoryAddress } from "../utils.js";

export type MultiOwnerModularAccount<
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = OwnedSmartContractAccount<
  "ModularAccountWithTokenReceiver" | "ModularAccountWithoutTokenReceiver",
  TOwner
>;

export type CreateMultiOwnerModularAccountParams<
  TTransport extends Transport = Transport,
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = {
  client: PublicErc4337Client<TTransport>;
  owner: TOwner;
  index?: bigint;
  factoryAddress?: Address;
  owners?: Address[];
  excludeDefaultTokenReceiverPlugin?: boolean;
  entrypointAddress?: Address;
  accountAddress?: Address;
  initCode?: Hex;
};

export async function createMultiOwnerModularAccount<
  TTransport extends Transport = Transport,
  TOwner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateMultiOwnerModularAccountParams<TTransport, TOwner>
): Promise<MultiOwnerModularAccount<TOwner>>;

export async function createMultiOwnerModularAccount({
  client,
  owner,
  accountAddress,
  initCode,
  entrypointAddress = getDefaultEntryPointAddress(client.chain),
  excludeDefaultTokenReceiverPlugin = false,
  factoryAddress = getDefaultMultiOwnerMSCAFactoryAddress(client.chain),
  owners = [],
  index = 0n,
}: CreateMultiOwnerModularAccountParams): Promise<MultiOwnerModularAccount> {
  const getAccountInitCode = async () => {
    if (initCode) {
      return initCode;
    }

    const ownerAddress = await owner.getAddress();
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
        abi: excludeDefaultTokenReceiverPlugin
          ? MultiOwnerMSCAFactoryAbi
          : MultiOwnerTokenReceiverMSCAFactoryAbi,
        functionName: "createAccount",
        args: [index, owners_],
      }),
    ]);
  };

  accountAddress = await getAccountAddress({
    client,
    entrypointAddress,
    accountAddress: accountAddress,
    getAccountInitCode,
  });

  const baseAccount = await toSmartContractAccount({
    client,
    entrypointAddress,
    accountAddress,
    source: `ModularAccount${
      excludeDefaultTokenReceiverPlugin ? "Without" : "With"
    }TokenReceiver`,
    getAccountInitCode,
    encodeExecute: async ({ target, data, value }) => {
      return encodeFunctionData({
        abi: IStandardExecutorAbi,
        functionName: "execute",
        args: [target, value ?? 0n, data],
      });
    },
    encodeBatchExecute: async (txs) => {
      return encodeFunctionData({
        abi: IStandardExecutorAbi,
        functionName: "executeBatch",
        args: [
          txs.map((tx) => ({
            target: tx.target,
            data: tx.data,
            value: tx.value ?? 0n,
          })),
        ],
      });
    },
    ...multiOwnerMessageSigner(client, accountAddress, owner),
  });

  return {
    ...baseAccount,
    publicKey: await owner.getAddress(),
    owner,
  };
}
