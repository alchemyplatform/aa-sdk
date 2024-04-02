import type { Address } from "abitype";
import {
  concatHex,
  encodeFunctionData,
  isHex,
  type Chain,
  type FallbackTransport,
  type Hex,
  type Transport,
} from "viem";
import { SimpleAccountAbi } from "../abis/SimpleAccountAbi.js";
import { SimpleAccountFactoryAbi } from "../abis/SimpleAccountFactoryAbi.js";
import { createBundlerClient } from "../client/bundlerClient.js";
import { getEntryPoint } from "../entrypoint/index.js";
import type {
  DefaultEntryPointVersion,
  EntryPointParameter,
  EntryPointVersion,
} from "../entrypoint/types.js";
import { AccountRequiresOwnerError } from "../errors/account.js";
import type { SmartAccountSigner } from "../signer/types.js";
import type { BatchUserOperationCallData } from "../types.js";
import { BaseSmartContractAccount } from "./base.js";
import { SimpleSmartAccountParamsSchema } from "./schema.js";
import {
  toSmartContractAccount,
  type SmartContractAccountWithSigner,
  type ToSmartContractAccountParams,
} from "./smartContractAccount.js";
import type { SimpleSmartAccountParams } from "./types.js";

class SimpleSmartContractAccount<
  TTransport extends Transport | FallbackTransport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> extends BaseSmartContractAccount<TTransport, TSigner> {
  protected index: bigint;

  constructor(params: SimpleSmartAccountParams<TTransport, TSigner>) {
    SimpleSmartAccountParamsSchema().parse(params);

    // This is a hack for now, we should kill the SimpleSmart Account when we kill Base Account
    const client = createBundlerClient({
      transport: params.transport as TTransport,
      chain: params.chain,
    });

    // @ts-expect-error zod custom type not recognized as required params for signers
    super({ ...params, rpcClient: client });
    this.signer = params.signer as TSigner;
    this.index = params.salt ?? 0n;
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
    return this.signer.signMessage(
      typeof msg === "string" && !isHex(msg) ? msg : { raw: msg }
    );
  }

  public async getAccountInitCode(): Promise<`0x${string}`> {
    return concatHex([
      this.factoryAddress,
      encodeFunctionData({
        abi: SimpleAccountFactoryAbi,
        functionName: "createAccount",
        args: [await this.signer.getAddress(), this.index],
      }),
    ]);
  }
}

export type SimpleSmartAccount<
  TSigner extends SmartAccountSigner,
  TEntryPointVersion extends EntryPointVersion = DefaultEntryPointVersion
> = SmartContractAccountWithSigner<
  "SimpleAccount",
  TSigner,
  TEntryPointVersion
>;

export type CreateSimpleAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = Omit<
  SimpleSmartAccountParams<TTransport, TSigner>,
  "chain" | "accountAddress" | "entryPointAddress"
> &
  Pick<
    ToSmartContractAccountParams<
      "SimpleAccount",
      TTransport,
      Chain,
      DefaultEntryPointVersion
    >,
    "chain" | "transport" | "accountAddress"
  > & {
    entryPoint?: EntryPointParameter<DefaultEntryPointVersion>["entryPoint"];
  };

export async function createSimpleSmartAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>({
  chain,
  entryPoint = getEntryPoint(chain),
  ...params
}: CreateSimpleAccountParams<TTransport, TSigner>): Promise<
  SimpleSmartAccount<TSigner>
> {
  if (!params.signer) throw new AccountRequiresOwnerError("SimpleAccount");
  const _entryPoint = entryPoint;
  const simpleAccount = new SimpleSmartContractAccount(
    SimpleSmartAccountParamsSchema().parse({
      chain,
      entryPointAddress: _entryPoint.address,
      ...params,
    })
  );

  const parsedParams = SimpleSmartAccountParamsSchema().parse({
    chain,
    entryPointAddress: _entryPoint.address,
    ...params,
  });

  const base = await toSmartContractAccount({
    source: "SimpleAccount",
    transport: params.transport,
    chain,
    encodeBatchExecute: simpleAccount.encodeBatchExecute.bind(simpleAccount),
    encodeExecute: (tx) =>
      simpleAccount.encodeExecute.bind(simpleAccount)(
        tx.target,
        tx.value ?? 0n,
        tx.data
      ),
    entryPoint: _entryPoint,
    getAccountInitCode: async () => {
      if (parsedParams.initCode) return parsedParams.initCode as Hex;
      return simpleAccount.getAccountInitCode();
    },
    getDummySignature: simpleAccount.getDummySignature.bind(simpleAccount),
    signMessage: ({ message }) =>
      simpleAccount.signMessage(
        typeof message === "string" ? message : message.raw
      ),
    // @ts-expect-error these types still represent the same thing, but they are just a little off in there definitions
    signTypedData: simpleAccount.signTypedData.bind(simpleAccount),
    accountAddress: parsedParams.accountAddress,
  });

  return {
    ...base,
    getSigner: () => simpleAccount.getSigner() as TSigner,
  };
}
