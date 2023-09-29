import {
  BaseSmartContractAccount,
  type BaseSmartAccountParams,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import type { Address } from "abitype";
import { parseAbiParameters } from "abitype";
import {
  concatHex,
  encodeAbiParameters,
  encodeFunctionData,
  hashMessage,
  toBytes,
  type FallbackTransport,
  type Hex,
  type Transport,
} from "viem";
import { KernelAccountAbi } from "./abis/KernelAccountAbi.js";
import { KernelFactoryAbi } from "./abis/KernelFactoryAbi.js";
import { MultiSendAbi } from "./abis/MultiSendAbi.js";
import { encodeCall } from "./utils.js";
import { KernelBaseValidator, ValidatorMode } from "./validator/base.js";

export interface KernelSmartAccountParams<
  TTransport extends Transport | FallbackTransport = Transport
> extends BaseSmartAccountParams<TTransport> {
  owner: SmartAccountSigner;
  factoryAddress: Address;
  index?: bigint;
  defaultValidator: KernelBaseValidator;
  validator?: KernelBaseValidator;
}

export class KernelSmartContractAccount<
  TTransport extends Transport | FallbackTransport = Transport
> extends BaseSmartContractAccount<TTransport> {
  private owner: SmartAccountSigner;
  private readonly factoryAddress: Address;
  private readonly index: bigint;
  private defaultValidator: KernelBaseValidator;
  private validator: KernelBaseValidator;

  constructor(params: KernelSmartAccountParams<TTransport>) {
    super(params);
    this.index = params.index ?? 0n;
    this.owner = params.owner;
    this.factoryAddress = params.factoryAddress;
    this.defaultValidator = params.defaultValidator!;
    this.validator = params.validator ?? params.defaultValidator!;
  }

  getDummySignature(): Hex {
    return "0x00000000b650d28e51cf39d5c0bb7db6d81cce5f0a77baba8bf8de587c0bc83fa70e374f3bfef2afb697dc5627c669de7dc13e96c85697e0f6aae2f2ebe227552d00cb181c";
  }

  async encodeExecute(target: Hex, value: bigint, data: Hex): Promise<Hex> {
    if (this.validator.mode !== ValidatorMode.sudo) {
      throw new Error("Validator Mode not supported");
    } else {
      return this.encodeExecuteAction(target, value, data, 0);
    }
  }

  async encodeExecuteDelegate(
    target: Hex,
    value: bigint,
    data: Hex
  ): Promise<Hex> {
    return this.encodeExecuteAction(target, value, data, 1);
  }

  override async encodeBatchExecute(
    _txs: BatchUserOperationCallData
  ): Promise<`0x${string}`> {
    const multiSendData: `0x${string}` = concatHex(
      _txs.map((tx) => encodeCall(tx))
    );
    return encodeFunctionData({
      abi: MultiSendAbi,
      functionName: "multiSend",
      args: [multiSendData],
    });
  }

  async signWithEip6492(msg: string | Uint8Array): Promise<Hex> {
    try {
      const formattedMessage = typeof msg === "string" ? toBytes(msg) : msg;
      let sig = await this.owner.signMessage(
        toBytes(hashMessage({ raw: formattedMessage }))
      );
      // If the account is undeployed, use ERC-6492
      if (!(await this.isAccountDeployed())) {
        sig = (encodeAbiParameters(
          parseAbiParameters("address, bytes, bytes"),
          [this.factoryAddress, await this.getFactoryInitCode(), sig]
        ) +
          "6492649264926492649264926492649264926492649264926492649264926492") as Hex; // magic suffix
      }

      return sig;
    } catch (err: any) {
      console.error("Got Error - ", err.message);
      throw new Error("Message Signing with EIP6492 failed");
    }
  }

  signMessage(msg: Uint8Array | string): Promise<Hex> {
    const formattedMessage = typeof msg === "string" ? toBytes(msg) : msg;
    return this.validator.signMessageWithValidatorParams(formattedMessage);
  }

  protected encodeExecuteAction(
    target: Hex,
    value: bigint,
    data: Hex,
    code: number
  ): Hex {
    return encodeFunctionData({
      abi: KernelAccountAbi,
      functionName: "execute",
      args: [target, value, data, code],
    });
  }
  protected async getAccountInitCode(): Promise<Hex> {
    return concatHex([this.factoryAddress, await this.getFactoryInitCode()]);
  }

  protected async getFactoryInitCode(): Promise<Hex> {
    try {
      return encodeFunctionData({
        abi: KernelFactoryAbi,
        functionName: "createAccount",
        args: [
          this.defaultValidator.getAddress(),
          await this.defaultValidator.getOwner(),
          this.index,
        ],
      });
    } catch (err: any) {
      console.error("err occurred:", err.message);
      throw new Error("Factory Code generation failed");
    }
  }
}
