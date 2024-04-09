import type { EntryPointDef } from "@alchemy/aa-core";
import {
  createBundlerClient,
  getAccountAddress,
  getVersion060EntryPoint,
  toSmartContractAccount,
  type Address,
  type SmartAccountSigner,
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
import { MultiOwnerModularAccountFactoryAbi } from "../abis/MultiOwnerModularAccountFactory.js";
import { multiOwnerMessageSigner } from "../plugins/multi-owner/signer.js";
import { getDefaultMultiOwnerModularAccountFactoryAddress } from "../utils.js";
import { standardExecutor } from "./standardExecutor.js";

export type MultiOwnerModularAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = SmartContractAccountWithSigner<"MultiOwnerModularAccount", TSigner>;

export type CreateMultiOwnerModularAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  transport: TTransport;
  chain: Chain;
  signer: TSigner;
  salt?: bigint;
  factoryAddress?: Address;
  owners?: Address[];
  entryPoint?: EntryPointDef<UserOperationRequest>;
  accountAddress?: Address;
  initCode?: Hex;
};

export async function createMultiOwnerModularAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateMultiOwnerModularAccountParams<TTransport, TSigner>
): Promise<MultiOwnerModularAccount<TSigner>>;

/**
 *
 * @param root0
 * @param root0.transport
 * @param root0.chain
 * @param root0.signer
 * @param root0.accountAddress
 * @param root0.initCode
 * @param root0.entryPoint
 * @param root0.factoryAddress
 * @param root0.owners
 * @param root0.salt
 * @returns
 */
export async function createMultiOwnerModularAccount({
  transport,
  chain,
  signer,
  accountAddress,
  initCode,
  entryPoint = getVersion060EntryPoint(chain),
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
    source: `MultiOwnerModularAccount`,
    getAccountInitCode,
    ...standardExecutor,
    ...multiOwnerMessageSigner(client, accountAddress, () => signer),
  });

  return {
    ...baseAccount,
    publicKey: await signer.getAddress(),
    getSigner: () => signer,
  };
}
