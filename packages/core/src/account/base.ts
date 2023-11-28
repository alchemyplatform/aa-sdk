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
import type { SmartAccountSigner } from "../signer/types.js";
import { wrapSignatureWith6492 } from "../signer/utils.js";
import type { BatchUserOperationCallData } from "../types.js";
import { getDefaultEntryPointAddress } from "../utils/defaults.js";
import { createBaseSmartAccountParamsSchema } from "./schema.js";
import type {
  BaseSmartAccountParams,
  ISmartContractAccount,
  SignTypedDataParams,
} from "./types.js";

export enum DeploymentState {
  UNDEFINED = "0x0",
  NOT_DEPLOYED = "0x1",
  DEPLOYED = "0x2",
}

export abstract class BaseSmartContractAccount<
  TTransport extends SupportedTransports = Transport
> implements ISmartContractAccount
{
  protected factoryAddress: Address;
  protected deploymentState: DeploymentState = DeploymentState.UNDEFINED;
  protected accountAddress?: Address;
  protected accountInitCode?: Hex;
  protected owner: SmartAccountSigner | undefined;
  protected entryPoint: GetContractReturnType<
    typeof EntryPointAbi,
    PublicClient,
    Chain
  >;
  protected entryPointAddress: Address;
  protected rpcProvider:
    | PublicErc4337Client<TTransport>
    | PublicErc4337Client<HttpTransport>;

  constructor(params_: BaseSmartAccountParams<TTransport>) {
    const params =
      createBaseSmartAccountParamsSchema<TTransport>().parse(params_);

    this.entryPointAddress =
      params.entryPointAddress ?? getDefaultEntryPointAddress(params.chain);

    const rpcUrl =
      typeof params.rpcClient === "string"
        ? params.rpcClient
        : params.rpcClient.transport.type === "http"
        ? (
            params.rpcClient.transport as ReturnType<HttpTransport>["config"] &
              ReturnType<HttpTransport>["value"]
          ).url || params.chain.rpcUrls.default.http[0]
        : undefined;

    const fetchOptions =
      typeof params.rpcClient === "string"
        ? undefined
        : params.rpcClient.transport.type === "http"
        ? (
            params.rpcClient.transport as ReturnType<HttpTransport>["config"] &
              ReturnType<HttpTransport>["value"]
          ).fetchOptions
        : undefined;

    this.rpcProvider = rpcUrl
      ? createPublicErc4337Client({
          chain: params.chain,
          rpcUrl,
          fetchOptions: {
            ...fetchOptions,
            headers: {
              ...fetchOptions?.headers,
              "Alchemy-Aa-Sdk-Signer": params.owner?.signerType || "unknown",
              "Alchemy-Aa-Sdk-Factory-Address": params.factoryAddress,
            },
          },
        })
      : (params.rpcClient as PublicErc4337Client<TTransport>);

    this.accountAddress = params.accountAddress;
    this.factoryAddress = params.factoryAddress;
    this.owner = params.owner;
    this.accountInitCode = params.initCode;

    this.entryPoint = getContract({
      address: this.entryPointAddress,
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
   * This is the concatenation of the account's factory address and the abi encoded function data of the account factory's `createAccount` method.
   * https://github.com/eth-infinitism/account-abstraction/blob/abff2aca61a8f0934e533d0d352978055fddbd96/contracts/core/SenderCreator.sol#L12
   */
  protected abstract getAccountInitCode(): Promise<Hash>;

  // #endregion abstract-methods

  // #region optional-methods

  /**
   * If your account handles 1271 signatures of personal_sign differently
   * than it does UserOperations, you can implement two different approaches to signing
   *
   * @param uoHash -- The hash of the UserOperation to sign
   * @returns the signature of the UserOperation
   */
  async signUserOperationHash(uoHash: Hash): Promise<Hash> {
    return this.signMessage(uoHash);
  }

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

  // Extra implementations
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

    return this._getAccountInitCode();
  }

  async getAddress(): Promise<Address> {
    if (!this.accountAddress) {
      const initCode = await this._getAccountInitCode();
      Logger.verbose(
        "[BaseSmartContractAccount](getAddress) initCode: ",
        initCode
      );
      try {
        await this.entryPoint.simulate.getSenderAddress([initCode]);
      } catch (err: any) {
        if (err.cause?.data?.errorName === "SenderAddressResult") {
          this.accountAddress = err.cause.data.args[0] as Address;
          Logger.verbose(
            "[BaseSmartContractAccount](getAddress) entrypoint.getSenderAddress result:",
            this.accountAddress
          );
          return this.accountAddress;
        }
      }

      throw new Error("getCounterFactualAddress failed");
    }

    return this.accountAddress;
  }

  getOwner(): SmartAccountSigner | undefined {
    return this.owner;
  }

  getFactoryAddress(): Address {
    return this.factoryAddress;
  }

  getEntryPointAddress(): Address {
    return this.entryPointAddress;
  }

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

  /**
   * https://eips.ethereum.org/EIPS/eip-4337#first-time-account-creation
   * The initCode field (if non-zero length) is parsed as a 20-byte address,
   * followed by calldata to pass to this address.
   * The factory address is the first 40 char after the 0x, and the callData is the rest.
   */
  protected async parseFactoryAddressFromAccountInitCode(): Promise<
    [Address, Hex]
  > {
    const initCode = await this._getAccountInitCode();
    const factoryAddress = `0x${initCode.substring(2, 42)}` as Address;
    const factoryCalldata = `0x${initCode.substring(42)}` as Hex;
    return [factoryAddress, factoryCalldata];
  }

  private async _getAccountInitCode(): Promise<Hash> {
    return this.accountInitCode ?? this.getAccountInitCode();
  }

  private async create6492Signature(
    isDeployed: boolean,
    signature: Hash
  ): Promise<Hash> {
    if (isDeployed) {
      return signature;
    }

    const [factoryAddress, factoryCalldata] =
      await this.parseFactoryAddressFromAccountInitCode();

    Logger.verbose(
      `[BaseSmartContractAccount](create6492Signature)\
        factoryAddress: ${factoryAddress}, factoryCalldata: ${factoryCalldata}`
    );

    return wrapSignatureWith6492({
      factoryAddress,
      factoryCalldata,
      signature,
    });
  }
}
