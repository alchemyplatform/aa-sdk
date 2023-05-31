import type { Address } from "abitype";
import {
  getContract,
  type Chain,
  type GetContractReturnType,
  type Hex,
  type HttpTransport,
  type PublicClient,
  type Transport,
} from "viem";
import { EntryPointAbi } from "../abis/EntryPointAbi.js";
import { createPublicErc4337Client } from "../client/create-client.js";
import type {
  PublicErc4337Client,
  SupportedTransports,
} from "../client/types.js";
import type { ISmartContractAccount } from "./types.js";
import type { BatchUserOperationCallData } from "../types.js";

export interface BaseSmartAccountParams<
  TTransport extends SupportedTransports = Transport
> {
  rpcClient: string | PublicErc4337Client<TTransport>;
  entryPointAddress: Address;
  chain: Chain;
  accountAddress?: Address;
}

export abstract class BaseSmartContractAccount<
  TTransport extends SupportedTransports = Transport
> implements ISmartContractAccount
{
  protected isDeployed?: boolean = undefined;
  protected accountAddress?: Address;
  protected entryPoint: GetContractReturnType<
    typeof EntryPointAbi,
    PublicClient,
    Chain
  >;
  protected entryPointAddress: Address;
  protected rpcProvider: PublicErc4337Client<TTransport | HttpTransport>;

  constructor(params: BaseSmartAccountParams<TTransport>) {
    this.entryPointAddress = params.entryPointAddress;
    this.rpcProvider =
      typeof params.rpcClient === "string"
        ? createPublicErc4337Client({
            chain: params.chain,
            rpcUrl: params.rpcClient,
          })
        : params.rpcClient;

    this.accountAddress = params.accountAddress;

    this.entryPoint = getContract({
      address: params.entryPointAddress,
      abi: EntryPointAbi,
      // Need to cast this as PublicClient or else it breaks ABI typing.
      // This is valid because our PublicClient is a subclass of PublicClient
      publicClient: this.rpcProvider as PublicClient,
    });
  }

  abstract getDummySignature(): `0x${string}`;
  abstract encodeExecute(
    target: string,
    value: bigint,
    data: string
  ): Promise<`0x${string}`>;
  abstract signMessage(msg: string | Uint8Array): Promise<`0x${string}`>;
  protected abstract getAccountInitCode(): Promise<`0x${string}`>;

  async encodeBatchExecute(
    _txs: BatchUserOperationCallData
  ): Promise<`0x${string}`> {
    throw new Error("encodeBatchExecute not supported");
  }

  async getNonce(): Promise<bigint> {
    if (!this.isDeployed) {
      return 0n;
    }
    const address = await this.getAddress();
    return this.entryPoint.read.getNonce([address, BigInt(0)]);
  }

  async getInitCode(): Promise<Hex> {
    if (this.isDeployed) {
      return "0x";
    }
    const contractCode = await this.rpcProvider.getContractCode(
      await this.getAddress()
    );

    if ((contractCode?.length ?? 0) > 2) {
      this.isDeployed = true;
      return "0x";
    }

    return await this.getAccountInitCode();
  }

  async getAddress(): Promise<Address> {
    if (!this.accountAddress) {
      const initCode = await this.getAccountInitCode();
      try {
        await this.entryPoint.simulate.getSenderAddress([initCode]);
      } catch (err: any) {
        if (err.cause?.data?.errorName === "SenderAddressResult") {
          this.accountAddress = err.cause.data.args[0] as Address;
          return this.accountAddress;
        }
      }

      throw new Error("getCounterFactualAddress failed");
    }

    return this.accountAddress;
  }
}
