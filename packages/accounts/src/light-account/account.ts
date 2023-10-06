import {
  SimpleSmartContractAccount,
  SmartAccountProvider,
  type SignTypedDataParams,
  type SmartAccountSigner,
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
} from "viem";
import { LightAccountAbi } from "./abis/LightAccountAbi.js";
import { LightAccountFactoryAbi } from "./abis/LightAccountFactoryAbi.js";

export class LightSmartContractAccount<
  TTransport extends Transport | FallbackTransport = Transport
> extends SimpleSmartContractAccount<TTransport> {
  override async signTypedData(params: SignTypedDataParams): Promise<Hash> {
    return this.owner.signTypedData(params);
  }

  /**
   * Returns the on-chain EOA owner of the account.
   *
   * @returns {Address} the on-chain EOA owner of the account
   */
  async getOwner(): Promise<Address> {
    const callResult = await this.rpcProvider.call({
      to: await this.getAddress(),
      data: encodeFunctionData({
        abi: LightAccountAbi,
        functionName: "owner",
      }),
    });

    if (callResult.data == null) {
      throw new Error("could not get on-chain owner");
    }

    const decodedCallResult = decodeFunctionResult({
      abi: LightAccountAbi,
      functionName: "owner",
      data: callResult.data,
    });

    if (decodedCallResult !== (await this.owner.getAddress())) {
      throw new Error("on-chain owner does not match account owner");
    }

    return decodedCallResult;
  }

  /**
   * Encodes the transferOwnership function call using the LightAccount ABI.
   *
   * @param newOwner - the new owner of the account
   * @returns {Hex} the encoded function call
   */
  static encodeTransferOwnership(newOwner: Address): Hex {
    return encodeFunctionData({
      abi: LightAccountAbi,
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
      account: LightSmartContractAccount<TTransport>;
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
        abi: LightAccountFactoryAbi,
        functionName: "createAccount",
        args: [await this.owner.getAddress(), this.index],
      }),
    ]);
  }
}
