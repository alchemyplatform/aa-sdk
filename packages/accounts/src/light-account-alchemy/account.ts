import {
  SimpleSmartContractAccount,
  wrapWith6492,
  type ConnectedSmartAccountProvider,
  type SignTypedDataParams,
  type SimpleSmartAccountParams,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import {
  encodeFunctionData,
  type Address,
  type FallbackTransport,
  type Hash,
  type Hex,
  type Transport,
} from "viem";
import { LightAccountAbi } from "./abis/LightAccountAbi.js";
import { LightAccountFactoryAbi } from "./abis/LightAccountFactoryAbi.js";

export type LightSmartAccountParams<
  TTransport extends Transport | FallbackTransport = Transport
> = SimpleSmartAccountParams<TTransport>;

export default class LightSmartContractAccount<
  TTransport extends Transport | FallbackTransport = Transport
> extends SimpleSmartContractAccount<TTransport> {
  private _factoryAddress: Address;

  constructor(params: LightSmartAccountParams<TTransport>) {
    super(params);
    this._factoryAddress = params.factoryAddress;
  }

  async signMessageWith6492(msg: string | Uint8Array): Promise<`0x${string}`> {
    const [isDeployed, signature] = await Promise.all([
      this.isAccountDeployed(),
      this.signMessage(msg),
    ]);

    return this.create6492Signature(isDeployed, signature);
  }

  override async signTypedData(
    _params: SignTypedDataParams
  ): Promise<`0x${string}`> {
    return this.owner.signTypedData(_params);
  }

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

    return wrapWith6492({
      signature,
      factoryAddress: this._factoryAddress,
      initCode: encodeFunctionData({
        abi: LightAccountFactoryAbi,
        functionName: "createAccount",
        args: [await this.owner.getAddress(), this.index],
      }),
    });
  }

  getOwner(): SmartAccountSigner {
    return this.owner;
  }

  private _setOwner(owner: SmartAccountSigner): void {
    this.owner = owner;
  }

  static async encodeTransferOwnership(newOwner: Address): Promise<Hex> {
    return encodeFunctionData({
      abi: LightAccountAbi,
      functionName: "transferOwnership",
      args: [newOwner],
    });
  }

  static async transferOwnership<
    TTransport extends Transport | FallbackTransport = Transport
  >(
    provider: ConnectedSmartAccountProvider<
      LightSmartContractAccount,
      TTransport
    >,
    newOwner: SmartAccountSigner
  ): Promise<Hash> {
    const data = await this.encodeTransferOwnership(
      await newOwner.getAddress()
    );
    const txn = await provider.sendUserOperation({
      target: await provider.getAddress(),
      data,
    });

    provider.account._setOwner(newOwner);

    return txn.hash;
  }
}
