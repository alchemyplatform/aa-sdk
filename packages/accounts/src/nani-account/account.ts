import {
  BaseSmartContractAccount,
  createBundlerClient,
  getEntryPoint,
  toSmartContractAccount,
  type BaseSmartAccountParams,
  type BatchUserOperationCallData,
  type DefaultEntryPointVersion,
  type SignTypedDataParams,
  type SmartAccountSigner,
  type SmartContractAccountWithSigner,
  type ToSmartContractAccountParams,
  type UserOperationCallData,
} from "@alchemy/aa-core";
import {
  concatHex,
  decodeFunctionResult,
  encodeFunctionData,
  isHex,
  numberToHex,
  type Address,
  type Chain,
  type FallbackTransport,
  type Hash,
  type Hex,
  type Transport,
} from "viem";
import { NaniAccountAbi } from "./abis/NaniAccountAbi.js";
import { NaniAccountFactoryAbi } from "./abis/NaniAccountFactoryAbi.js";

export type NaniSmartAccountParams<
  TTransport extends Transport | FallbackTransport = Transport
> = Omit<BaseSmartAccountParams<TTransport>, "rpcClient"> & {
  signer: SmartAccountSigner;
  index?: bigint;
  salt?: Hex;
  transport: TTransport;
  chain: Chain;
};

export type NaniAccount = SmartContractAccountWithSigner<
  "NaniAccount",
  SmartAccountSigner,
  "0.6.0"
> & {
  encodeExecuteDelegate: (delegate: Address, data: Hex) => Hex;
  encodeTransferOwnership: (newOwner: Address) => Hex;
};

class NaniAccount_<
  TTransport extends Transport | FallbackTransport = Transport
> extends BaseSmartContractAccount<TTransport> {
  protected signer: SmartAccountSigner;
  private readonly index: bigint;
  protected salt?: Hex;

  constructor(params: NaniSmartAccountParams<TTransport>) {
    // This is a hack for now, we should kill the SimpleSmart Account when we kill Base Account
    const client = createBundlerClient({
      transport: params.transport as TTransport,
      chain: params.chain,
    });
    super({ ...params, rpcClient: client });

    this.index = params.index ?? 0n;
    this.signer = params.signer;
    this.salt = params.salt;
  }

  override async signTypedData(params: SignTypedDataParams): Promise<Hash> {
    return this.signer.signTypedData(params);
  }

  /**
   * Returns the on-chain owner address of the account.
   *
   * @returns the on-chain owner of the account
   */
  async getOwnerAddress(): Promise<Address> {
    const callResult = await this.rpcProvider.call({
      to: await this.getAddress(),
      data: encodeFunctionData({
        abi: NaniAccountAbi,
        functionName: "owner",
      }),
    });

    if (callResult.data == null) {
      throw new Error("could not get on-chain owner");
    }

    const decodedCallResult = decodeFunctionResult({
      abi: NaniAccountAbi,
      functionName: "owner",
      data: callResult.data,
    });

    if (decodedCallResult !== (await this.signer.getAddress())) {
      throw new Error(
        "current account signer does not match the on-chain owner"
      );
    }

    return decodedCallResult;
  }

  async getAddress(): Promise<Address> {
    const callResult = await this.rpcProvider.call({
      to: this.factoryAddress,
      data: encodeFunctionData({
        abi: NaniAccountFactoryAbi,
        functionName: "getAddress",
        args: [await this.getSalt()],
      }),
    });

    if (callResult.data == null) {
      throw new Error("could not get deterministic address");
    }

    const decodedCallResult = decodeFunctionResult({
      abi: NaniAccountFactoryAbi,
      functionName: "getAddress",
      data: callResult.data,
    });

    return decodedCallResult;
  }

  getDummySignature(): Hex {
    return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
  }

  signMessage(msg: Uint8Array | string): Promise<Hex> {
    return this.signer.signMessage(
      typeof msg === "string" && !isHex(msg) ? msg : { raw: msg }
    );
  }

  async encodeExecute(target: Hex, value: bigint, data: Hex): Promise<Hex> {
    return encodeFunctionData({
      abi: NaniAccountAbi,
      functionName: "execute",
      args: [target, value, data],
    });
  }

  override async encodeBatchExecute(
    calls: BatchUserOperationCallData
  ): Promise<Hex> {
    return encodeFunctionData({
      abi: NaniAccountAbi,
      functionName: "executeBatch",
      args: [
        calls.map((call: Exclude<UserOperationCallData, Hex>) => ({
          ...call,
          value: call.value ?? 0n,
        })),
      ],
    });
  }

  /**
   * Encodes the delegateExecute function call using Nani Account ABI.
   *
   * @param delegate - the delegate to execute the function call
   * @param data - the data to be passed to the function call
   * @returns the encoded function call
   */
  static encodeExecuteDelegate(delegate: Address, data: Hex): Hex {
    return encodeFunctionData({
      abi: NaniAccountAbi,
      functionName: "delegateExecute",
      args: [delegate, data],
    });
  }

  /**
   * Encodes the transferOwnership function call using Nani Account ABI.
   *
   * @param newOwner - the new owner of the account
   * @returns the encoded function call
   */
  static encodeTransferOwnership(newOwner: Address): Hex {
    return encodeFunctionData({
      abi: NaniAccountAbi,
      functionName: "transferOwnership",
      args: [newOwner],
    });
  }

  override async getAccountInitCode(): Promise<`0x${string}`> {
    const result = concatHex([
      this.factoryAddress,
      await this.getFactoryInitCode(),
    ]);

    return result;
  }

  protected async getSalt(): Promise<Hex> {
    if (this.salt) {
      if (this.salt.slice(0, 42) !== (await this.signer.getAddress())) {
        throw new Error("Salt does not match the current signer address");
      } else {
        return this.salt;
      }
    }

    return concatHex([
      await this.signer.getAddress(),
      numberToHex(this.index, { size: 12 }),
    ]);
  }

  protected async getFactoryInitCode(): Promise<Hex> {
    try {
      return encodeFunctionData({
        abi: NaniAccountFactoryAbi,
        functionName: "createAccount",
        args: [await this.signer.getAddress(), await this.getSalt()],
      });
    } catch (err: any) {
      throw new Error("Factory Code generation failed");
    }
  }
}

export const createNaniAccount = async <TTransport extends Transport>(
  params: Omit<NaniSmartAccountParams<TTransport>, "rpcClient" | "chain"> &
    Pick<
      ToSmartContractAccountParams<DefaultEntryPointVersion>,
      "chain" | "transport"
    >
): Promise<NaniAccount> => {
  if (!params.signer) throw new Error("Owner must be provided.");

  const naniAccount = new NaniAccount_(params);

  const base = await toSmartContractAccount({
    source: "NaniAccount",
    transport: params.transport,
    chain: params.chain,
    accountAddress: params.accountAddress as Address | undefined,
    entryPoint: getEntryPoint(params.chain, {
      addressOverride: naniAccount.getEntryPointAddress(),
    }),
    encodeBatchExecute: naniAccount.encodeBatchExecute.bind(naniAccount),
    encodeExecute: (tx) =>
      naniAccount.encodeExecute(tx.target, tx.value ?? 0n, tx.data),
    getAccountInitCode: async () => {
      if (params.initCode) return params.initCode as Hex;
      return naniAccount.getAccountInitCode();
    },
    getDummySignature: naniAccount.getDummySignature.bind(naniAccount),
    signMessage: ({ message }) =>
      naniAccount.signMessage(
        typeof message === "string" ? message : message.raw
      ),
    // @ts-expect-error these types still represent the same thing, but they are just a little off in there definitions
    signTypedData: (params) => naniAccount.signTypedData(params),
  });

  return {
    ...base,
    getSigner: () => naniAccount.getSigner() as SmartAccountSigner,
    encodeExecuteDelegate: NaniAccount_.encodeExecuteDelegate,
    encodeTransferOwnership: NaniAccount_.encodeTransferOwnership,
  };
};
