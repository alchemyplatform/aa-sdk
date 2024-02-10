import type { EntryPointDef } from "@alchemy/aa-core";
import {
  createBundlerClient,
  getAccountAddress,
  getVersion060EntryPoint,
  toSmartContractAccount,
  type Address,
  type OwnedSmartContractAccount,
  type SmartAccountSigner,
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
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = OwnedSmartContractAccount<"MultiOwnerModularAccount", TOwner>;

export type CreateMultiOwnerModularAccountParams<
  TTransport extends Transport = Transport,
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = {
  transport: TTransport;
  chain: Chain;
  owner: TOwner;
  index?: bigint;
  factoryAddress?: Address;
  owners?: Address[];
  entryPoint?: EntryPointDef<UserOperationRequest>;
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
  transport,
  chain,
  owner: owner_,
  accountAddress,
  initCode,
  entryPoint = getVersion060EntryPoint(chain),
  factoryAddress = getDefaultMultiOwnerModularAccountFactoryAddress(chain),
  owners = [],
  index = 0n,
}: CreateMultiOwnerModularAccountParams): Promise<MultiOwnerModularAccount> {
  let owner = owner_;
  const client = createBundlerClient({
    transport,
    chain,
  });
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
        abi: MultiOwnerModularAccountFactoryAbi,
        functionName: "createAccount",
        args: [index, owners_],
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
    ...multiOwnerMessageSigner(client, accountAddress, () => owner),
  });

  return {
    ...baseAccount,
    publicKey: await owner.getAddress(),
    getOwner: () => owner,
    setOwner: (newOwner) => {
      owner = newOwner;
    },
  };
}
