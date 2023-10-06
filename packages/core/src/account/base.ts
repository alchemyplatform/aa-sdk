import type { Address } from "abitype";
import {
  getContract,
  type Chain,
  type GetContractReturnType,
  type Hash,
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
import { wrapSignatureWith6492 } from "../signer/utils.js";
import type { BatchUserOperationCallData } from "../types.js";
import type { ISmartContractAccount, SignTypedDataParams } from "./types.js";

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
  protected rpcProvider:
    | PublicErc4337Client<TTransport>
    | PublicErc4337Client<HttpTransport>;

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

  // #region abstract-methods

  /**
   * This method should return a signature that will not `revert` during validation.
   * It does not have to pass validation, just not cause the contract to revert.
   * This is required for gas estimation so that the gas estimate are accurate.
   *
   */
  abstract getDummySignature(): Hash;

  /**
   * this method should return the abi encoded function data for a call to your contract's `execute` method
   *
   * @param target -- equivalent to `to` in a normal transaction
   * @param value -- equivalent to `value` in a normal transaction
   * @param data -- equivalent to `data` in a normal transaction
   * @returns abi encoded function data for a call to your contract's `execute` method
   */
  abstract encodeExecute(
    target: string,
    value: bigint,
    data: string
  ): Promise<Hash>;

  /**
   * this should return an ERC-191 compliant message and is used to sign UO Hashes
   *
   * @param msg -- the message to sign
   */
  abstract signMessage(msg: string | Uint8Array): Promise<Hash>;

  /**
   * this should return the init code that will be used to create an account if one does not exist.
   * Usually this is the concatenation of the account's factory address and the abi encoded function data of the account factory's `createAccount` method.
   */
  protected abstract getAccountInitCode(): Promise<Hash>;

  // #endregion abstract-methods

  // #region optional-methods

  /**
   * If your contract supports signing and verifying typed data,
   * you should implement this method.
   *
   * @param _params -- Typed Data params to sign
   */
  async signTypedData(_params: SignTypedDataParams): Promise<`0x${string}`> {
    throw new Error("signTypedData not supported");
  }

  /**
   * This method should wrap the result of `signMessage` as per
   * [EIP-6492](https://eips.ethereum.org/EIPS/eip-6492)
   *
   * @param msg -- the message to sign
   */
  async signMessageWith6492(msg: string | Uint8Array): Promise<`0x${string}`> {
    const [isDeployed, signature] = await Promise.all([
      this.isAccountDeployed(),
      this.signMessage(msg),
    ]);

    return this.create6492Signature(isDeployed, signature);
  }

  /**
   * Similar to the signMessageWith6492 method above,
   * this method should wrap the result of `signTypedData` as per
   * [EIP-6492](https://eips.ethereum.org/EIPS/eip-6492)
   *
   * @param params -- Typed Data params to sign
   */
  async signTypedDataWith6492(
    params: SignTypedDataParams
  ): Promise<`0x${string}`> {
    const [isDeployed, signature] = await Promise.all([
      this.isAccountDeployed(),
      this.signTypedData(params),
    ]);

    return this.create6492Signature(isDeployed, signature);
  }

  private async create6492Signature(
    isDeployed: boolean,
    signature: Hash
  ): Promise<Hash> {
    if (isDeployed) {
      return signature;
    }

    // https://eips.ethereum.org/EIPS/eip-4337#first-time-account-creation
    // The initCode field (if non-zero length) is parsed as a 20-byte address,
    // followed by calldata to pass to this address.
    // The factory address is the first 40 char after the 0x, and the callData is the rest.
    const initCode = await this.getAccountInitCode();
    const factoryAddress = `0x${initCode.substring(2, 42)}` as Hex;
    const factoryCalldata = `0x${initCode.substring(42)}` as Hex;

    Logger.debug(
      `[BaseSmartContractAccount](create6492Signature) initCode: ${initCode}, \
        factoryAddress: ${factoryAddress}, factoryCalldata: ${factoryCalldata}`
    );

    return wrapSignatureWith6492({
      factoryAddress,
      factoryCalldata,
      signature,
    });
  }

  /**
   * Not all contracts support batch execution.
   * If your contract does, this method should encode a list of
   * transactions into the call data that will be passed to your
   * contract's batch execution method.
   *
   * @param _txs -- the transactions to batch execute
   */
  async encodeBatchExecute(
    _txs: BatchUserOperationCallData
  ): Promise<`0x${string}`> {
    throw new Error("encodeBatchExecute not supported");
  }
  // #endregion optional-methods

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
    const contractCode = await this.rpcProvider.getBytecode({
      address: await this.getAddress(),
    });

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
