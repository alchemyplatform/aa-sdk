import {
  BaseSmartContractAccount,
  toSmartContractAccount,
  type BaseSmartAccountParams,
  type BatchUserOperationCallData,
  type OwnedSmartContractAccount,
  type PublicErc4337Client,
  type SignTypedDataParams,
  type SmartAccountSigner,
  type UserOperationCallData,
} from "@alchemy/aa-core";
import {
  concatHex,
  decodeFunctionResult,
  encodeFunctionData,
  hexToBytes,
  numberToHex,
  type Address,
  type FallbackTransport,
  type Hash,
  type Hex,
  type Transport,
} from "viem";
import { NaniAccountAbi } from "./abis/NaniAccountAbi.js";
import { NaniAccountFactoryAbi } from "./abis/NaniAccountFactoryAbi.js";

export interface NaniSmartAccountParams<
  TTransport extends Transport | FallbackTransport = Transport
> extends BaseSmartAccountParams<TTransport> {
  owner: SmartAccountSigner;
  index?: bigint;
  salt?: Hex;
}

export type NaniAccount = OwnedSmartContractAccount<
  "NaniAccount",
  SmartAccountSigner
> & {
  encodeExecuteDelegate: (delegate: Address, data: Hex) => Hex;
  encodeTransferOwnership: (newOwner: Address) => Hex;
};

class NaniAccount_<
  TTransport extends Transport | FallbackTransport = Transport
> extends BaseSmartContractAccount<TTransport> {
  protected owner: SmartAccountSigner;
  private readonly index: bigint;
  protected salt?: Hex;

  constructor(params: NaniSmartAccountParams<TTransport>) {
    super(params);

    this.index = params.index ?? 0n;
    this.owner = params.owner;
    this.salt = params.salt;
  }

  override async signTypedData(params: SignTypedDataParams): Promise<Hash> {
    return this.owner.signTypedData(params);
  }

  /**
   * Returns the on-chain EOA owner address of the account.
   *
   * @returns {Address} the on-chain EOA owner of the account
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

    if (decodedCallResult !== (await this.owner.getAddress())) {
      throw new Error("on-chain owner does not match account owner");
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
    if (typeof msg === "string" && msg.startsWith("0x")) {
      msg = hexToBytes(msg as Hex);
    } else if (typeof msg === "string") {
      msg = new TextEncoder().encode(msg);
    }

    return this.owner.signMessage(msg);
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
   * @returns {Hex} the encoded function call
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
   * @returns {Hex} the encoded function call
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
      if (this.salt.slice(0, 42) !== (await this.owner.getAddress())) {
        throw new Error("Salt does not match owner");
      } else {
        return this.salt;
      }
    }

    return concatHex([
      await this.owner.getAddress(),
      numberToHex(this.index, { size: 12 }),
    ]);
  }

  setOwner(owner: SmartAccountSigner) {
    this.owner = owner;
  }

  protected async getFactoryInitCode(): Promise<Hex> {
    try {
      return encodeFunctionData({
        abi: NaniAccountFactoryAbi,
        functionName: "createAccount",
        args: [await this.owner.getAddress(), await this.getSalt()],
      });
    } catch (err: any) {
      throw new Error("Factory Code generation failed");
    }
  }
}

export const createNaniAccount = async <TTransport extends Transport>(
  params: NaniSmartAccountParams<TTransport>
): Promise<NaniAccount> => {
  if (!params.owner) throw new Error("Owner must be provided.");

  const naniAccount = new NaniAccount_(params);

  const base = await toSmartContractAccount({
    source: "NaniAccount",
    client: naniAccount.rpcProvider as PublicErc4337Client<TTransport>,
    accountAddress: params.accountAddress as Address | undefined,
    entrypointAddress: naniAccount.getEntryPointAddress(),
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
    // @ts-expect-error these types still represent the same thing, but they're just a little off in there definitions
    signTypedData: (params) => naniAccount.signTypedData(params),
  });

  return {
    ...base,
    getOwner: () => naniAccount.getOwner() as SmartAccountSigner,
    setOwner: (owner) => naniAccount.setOwner.bind(naniAccount)(owner),
    encodeExecuteDelegate: NaniAccount_.encodeExecuteDelegate,
    encodeTransferOwnership: NaniAccount_.encodeTransferOwnership,
  };
};
