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
import type { PublicErc4337Client } from "../client/publicErc4337Client.js";
import type { SmartAccountSigner } from "../signer/types.js";
import type { BatchUserOperationCallData } from "../types.js";
import { BaseSmartContractAccount } from "./base.js";
import { SimpleSmartAccountParamsSchema } from "./schema.js";
import {
  toSmartContractAccount,
  type OwnedSmartContractAccount,
} from "./smartContractAccount.js";
import type { SimpleSmartAccountParams } from "./types.js";

class SimpleSmartContractAccount<
  TTransport extends Transport | FallbackTransport = Transport
> extends BaseSmartContractAccount<TTransport, SmartAccountSigner> {
  protected index: bigint;

  constructor(params: SimpleSmartAccountParams<TTransport>) {
    SimpleSmartAccountParamsSchema<TTransport>().parse(params);

    super(params);
    this.owner = params.owner;
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
  params: SimpleSmartAccountParams<TTransport, TOwner>
): Promise<SimpleSmartAccount<TOwner>> => {
  if (!params.owner) throw new Error("Owner must be provided.");

  // @ts-expect-error base account allows for optional owners, but simple account requires it
  const simpleAccount = new SimpleSmartContractAccount<TTransport>(params);
  const parsedParams = SimpleSmartAccountParamsSchema<
    TTransport,
    TOwner
  >().parse(params);

  const base = await toSmartContractAccount({
    source: "SimpleAccount",
    client: simpleAccount.rpcProvider as PublicErc4337Client<TTransport>,
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
    owner: parsedParams.owner as TOwner,
  };
};
