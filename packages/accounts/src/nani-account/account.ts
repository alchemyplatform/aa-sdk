import {
  BaseSmartContractAccount,
  SmartAccountProvider,
  type SignTypedDataParams,
  type SmartAccountSigner,
  type BaseSmartAccountParams,
  type BatchUserOperationCallData,
  type UserOperationCallData,
} from "@alchemy/aa-core";
import {
  concatHex,
  decodeFunctionResult,
  encodeFunctionData,
  type Address,
  type FallbackTransport,
  type Hash,
  type Hex,
  type Transport,
  numberToHex,
  hexToBytes,
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

export class NaniAccount<
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

  /**
   * Transfers ownership of the account to the newOwner on-chain and also updates the owner of the account.
   * Optionally waits for the transaction to be mined.
   *
   * @param provider - the provider to use to send the transaction
   * @param newOwner - the new owner of the account
   * @param waitForTxn - whether or not to wait for the transaction to be mined
   * @returns {Hash} the userOperation hash, or transaction hash if `waitForTxn` is true
   */
  static async transferOwnership<
    TTransport extends Transport | FallbackTransport = Transport
  >(
    provider: SmartAccountProvider<TTransport> & {
      account: NaniAccount<TTransport>;
    },
    newOwner: SmartAccountSigner,
    waitForTxn: boolean = false
  ): Promise<Hash> {
    const data = this.encodeTransferOwnership(await newOwner.getAddress());
    const result = await provider.sendUserOperation({
      target: await provider.getAddress(),
      data,
    });

    provider.account.owner = newOwner;

    if (waitForTxn) {
      return provider.waitForUserOperationTransaction(result.hash);
    }

    return result.hash;
  }

  protected override async getAccountInitCode(): Promise<`0x${string}`> {
    const result = await concatHex([
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
