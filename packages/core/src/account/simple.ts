import type { Address } from "abitype";
import {
  concatHex,
  encodeFunctionData,
  hexToBytes,
  type FallbackTransport,
  type Hex,
  type Transport,
} from "viem";
import { SimpleAccountAbi } from "../abis/SimpleAccountAbi.js";
import { SimpleAccountFactoryAbi } from "../abis/SimpleAccountFactoryAbi.js";
import { createBundlerClient } from "../client/bundlerClient.js";
import { AccountRequiresOwnerError } from "../errors/account.js";
import type { SmartAccountSigner } from "../signer/types.js";
import type { BatchUserOperationCallData } from "../types.js";
import { BaseSmartContractAccount } from "./base.js";
import { SimpleSmartAccountParamsSchema } from "./schema.js";
import {
  toSmartContractAccount,
  type OwnedSmartContractAccount,
  type ToSmartContractAccountParams,
} from "./smartContractAccount.js";
import type { SimpleSmartAccountParams } from "./types.js";

class SimpleSmartContractAccount<
  TTransport extends Transport | FallbackTransport = Transport,
  TOwner extends SmartAccountSigner = SmartAccountSigner
> extends BaseSmartContractAccount<TTransport, TOwner> {
  protected index: bigint;

  constructor(params: SimpleSmartAccountParams<TTransport, TOwner>) {
    SimpleSmartAccountParamsSchema<TTransport>().parse(params);

    // This is a hack for now, we should kill the SimpleSmart Account when we kill Base Account
    const client = createBundlerClient({
      transport: params.transport as TTransport,
      chain: params.chain,
    });
    super({ ...params, rpcClient: client });
    this.owner = params.owner as TOwner;
    this.index = params.index ?? 0n;
  }

  getDummySignature(): `0x${string}` {
    return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
  }

  async encodeExecute(
    target: Hex,
    value: bigint,
    data: Hex
  ): Promise<`0x${string}`> {
    return encodeFunctionData({
      abi: SimpleAccountAbi,
      functionName: "execute",
      args: [target, value, data],
    });
  }

  override async encodeBatchExecute(
    txs: BatchUserOperationCallData
  ): Promise<`0x${string}`> {
    const [targets, datas] = txs.reduce(
      (accum, curr) => {
        accum[0].push(curr.target);
        accum[1].push(curr.data);

        return accum;
      },
      [[], []] as [Address[], Hex[]]
    );

    return encodeFunctionData({
      abi: SimpleAccountAbi,
      functionName: "executeBatch",
      args: [targets, datas],
    });
  }

  signMessage(msg: Uint8Array | string): Promise<`0x${string}`> {
    if (typeof msg === "string" && msg.startsWith("0x")) {
      msg = hexToBytes(msg as Hex);
    } else if (typeof msg === "string") {
      msg = new TextEncoder().encode(msg);
    }

    return this.owner.signMessage(msg);
  }

  setOwner(owner: TOwner): void {
    this.owner = owner;
  }

  public async getAccountInitCode(): Promise<`0x${string}`> {
    return concatHex([
      this.factoryAddress,
      encodeFunctionData({
        abi: SimpleAccountFactoryAbi,
        functionName: "createAccount",
        args: [await this.owner.getAddress(), this.index],
      }),
    ]);
  }
}

export type SimpleSmartAccount<TOwner extends SmartAccountSigner> =
  OwnedSmartContractAccount<"SimpleAccount", TOwner>;

export const createSimpleSmartAccount = async <
  TTransport extends Transport = Transport,
  TOwner extends SmartAccountSigner = SmartAccountSigner
>(
  params: Omit<
    SimpleSmartAccountParams<TTransport, TOwner>,
    "rpcClient" | "chain"
  > &
    Pick<ToSmartContractAccountParams, "chain" | "transport">
): Promise<SimpleSmartAccount<TOwner>> => {
  if (!params.owner) throw new AccountRequiresOwnerError("SimpleAccount");

  // @ts-expect-error base account allows for optional owners, but simple account requires it
  const simpleAccount = new SimpleSmartContractAccount<TTransport>(params);
  const parsedParams = SimpleSmartAccountParamsSchema<
    TTransport,
    TOwner
  >().parse(params);

  const base = await toSmartContractAccount({
    source: "SimpleAccount",
    transport: params.transport,
    chain: params.chain,
    encodeBatchExecute: simpleAccount.encodeBatchExecute.bind(simpleAccount),
    encodeExecute: (tx) =>
      simpleAccount.encodeExecute.bind(simpleAccount)(
        tx.target,
        tx.value ?? 0n,
        tx.data
      ),
    entrypointAddress: simpleAccount.getEntryPointAddress(),
    getAccountInitCode: async () => {
      if (parsedParams.initCode) return parsedParams.initCode;
      return simpleAccount.getAccountInitCode();
    },
    getDummySignature: simpleAccount.getDummySignature.bind(simpleAccount),
    signMessage: ({ message }) =>
      simpleAccount.signMessage(
        typeof message === "string" ? message : message.raw
      ),
    // @ts-expect-error these types still represent the same thing, but they're just a little off in there definitions
    signTypedData: simpleAccount.signTypedData.bind(simpleAccount),
    accountAddress: parsedParams.accountAddress,
  });

  return {
    ...base,
    getOwner: () => simpleAccount.getOwner() as TOwner,
    setOwner: (owner: TOwner) =>
      simpleAccount.setOwner.bind(simpleAccount)(owner),
  };
};
