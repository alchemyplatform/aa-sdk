import {
  BaseSmartContractAccount,
  SmartAccountProvider,
  type SignTypedDataParams,
  type SmartAccountSigner,
  type BaseSmartAccountParams,
  type BatchUserOperationCallData,
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
import { NaniAccountFactoryAbi } from "./abis/NaniAccountFactory.js";

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
        calls.map((call) => ({
          ...call,
          value: call.value ?? 0n,
        })),
      ],
    });
  }

  async encodeExecuteDelegate(delegate: Address, data: Hex): Promise<Hex> {
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
    return concatHex([
      this.factoryAddress,
      encodeFunctionData({
        abi: NaniAccountFactoryAbi,
        functionName: "createAccount",
        args: [
          await this.owner.getAddress(),
          this.salt ?? numberToHex(this.index, { size: 32 }),
        ],
      }),
    ]);
  }
}
