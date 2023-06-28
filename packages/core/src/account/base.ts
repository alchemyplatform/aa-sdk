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
import { Logger } from "../logger.js";
import type { BatchUserOperationCallData } from "../types.js";
import type { ISmartContractAccount } from "./types.js";

export enum DeploymentState {
  UNDEFINED = "0x0",
  NOT_DEPLOYED = "0x1",
  DEPLOYED = "0x2",
}

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
  protected deploymentState: DeploymentState = DeploymentState.UNDEFINED;
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
    if (!(await this.isAccountDeployed())) {
      return 0n;
    }
    const address = await this.getAddress();
    return this.entryPoint.read.getNonce([address, BigInt(0)]);
  }

  async getInitCode(): Promise<Hex> {
    if (this.deploymentState === DeploymentState.DEPLOYED) {
      return "0x";
    }
    const contractCode = await this.rpcProvider.getContractCode(
      await this.getAddress()
    );

    if ((contractCode?.length ?? 0) > 2) {
      this.deploymentState = DeploymentState.DEPLOYED;
      return "0x";
    } else {
      this.deploymentState = DeploymentState.NOT_DEPLOYED;
    }

    return this.getAccountInitCode();
  }

  async getAddress(): Promise<Address> {
    if (!this.accountAddress) {
      const initCode = await this.getAccountInitCode();
      Logger.debug(
        "[BaseSmartContractAccount](getAddress) initCode: ",
        initCode
      );
      try {
        await this.entryPoint.simulate.getSenderAddress([initCode]);
      } catch (err: any) {
        Logger.debug(
          "[BaseSmartContractAccount](getAddress) entrypoint.getSenderAddress result: ",
          err
        );
        if (err.cause?.data?.errorName === "SenderAddressResult") {
          this.accountAddress = err.cause.data.args[0] as Address;
          return this.accountAddress;
        }
      }

      throw new Error("getCounterFactualAddress failed");
    }

    return this.accountAddress;
  }

  // Extra implementations
  async isAccountDeployed(): Promise<boolean> {
    return (await this.getDeploymentState()) === DeploymentState.DEPLOYED;
  }

  async getDeploymentState(): Promise<DeploymentState> {
    if (this.deploymentState === DeploymentState.UNDEFINED) {
      const initCode = await this.getInitCode();
      return initCode === "0x"
        ? DeploymentState.DEPLOYED
        : DeploymentState.NOT_DEPLOYED;
    } else {
      return this.deploymentState;
    }
  }
}
