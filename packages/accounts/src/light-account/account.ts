import {
  SimpleSmartContractAccount,
  SmartAccountProvider,
  type SignTypedDataParams,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import {
  concatHex,
  decodeFunctionResult,
  encodeAbiParameters,
  encodeFunctionData,
  keccak256,
  slice,
  type Address,
  type FallbackTransport,
  type Hash,
  type Hex,
  type Transport,
} from "viem";
import { MultiOwnerPluginAbi } from "../../plugindefs/multi-owner/abi.js";
import { MultiOwnerPluginAddress } from "../../plugindefs/multi-owner/config.js";
import { UpgradeableModularAccountAbi } from "../msca/abis/UpgradeableModularAccount.js";
import type { MSCA } from "../msca/builder.js";
import { createMultiOwnerMSCA } from "../msca/multi-owner-account.js";
import { LightAccountAbi } from "./abis/LightAccountAbi.js";
import { LightAccountFactoryAbi } from "./abis/LightAccountFactoryAbi.js";

export class LightSmartContractAccount<
  TTransport extends Transport | FallbackTransport = Transport
> extends SimpleSmartContractAccount<TTransport> {
  static readonly implementationAddress =
    "0x5467b1947f47d0646704eb801e075e72aeae8113";
  static readonly storageSlot = "0x5467b1947f47d0646704eb801e075e72aeae8113";

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

  static async upgrade<
    TTransport extends Transport | FallbackTransport = Transport
  >(
    provider: SmartAccountProvider<TTransport> & {
      account: LightSmartContractAccount<TTransport>;
    },
    waitForTxn: boolean = false
  ): Promise<{
    hash: Hash;
    provider: SmartAccountProvider<TTransport> & {
      account: MSCA;
    };
  }> {
    const accountAddress = await provider.getAddress();

    const storage = await provider.rpcClient.getStorageAt({
      address: accountAddress,
      slot: LightSmartContractAccount.storageSlot,
    });

    if (
      storage == null ||
      !(
        slice(storage, storage.length - 40) ===
        LightSmartContractAccount.implementationAddress
      )
    ) {
      throw new Error(
        "could not determine if smart account implementation is light account"
      );
    }

    const hashedMultiOwnerPluginManifest = keccak256(
      encodeFunctionData({
        abi: MultiOwnerPluginAbi,
        functionName: "pluginManifest",
      })
    );

    const ownerAddress = await provider.account.getOwnerAddress();
    const encodedOwner = encodeAbiParameters(
      [{ name: "owner", type: "address" }],
      [ownerAddress]
    );

    const encodedPluginInitData = encodeAbiParameters(
      [
        { name: "manifestHashes", type: "bytes32[]" },
        { name: "pluginInstallDatas", type: "bytes[]" },
      ],
      [[hashedMultiOwnerPluginManifest], [encodedOwner]]
    );

    const encodeMSCAInitializeData = encodeFunctionData({
      abi: UpgradeableModularAccountAbi,
      functionName: "initialize",
      args: [[MultiOwnerPluginAddress], encodedPluginInitData],
    });

    const encodeUpgradeData = encodeFunctionData({
      abi: LightAccountAbi,
      functionName: "upgradeToAndCall",
      args: [
        LightSmartContractAccount.implementationAddress,
        encodeMSCAInitializeData,
      ],
    });

    const result = await provider.sendUserOperation({
      target: accountAddress,
      data: encodeUpgradeData,
    });

    let hash = result.hash;
    if (waitForTxn) {
      hash = await provider.waitForUserOperationTransaction(result.hash);
    }

    return {
      hash,
      provider: provider.connect((rpcClient) =>
        createMultiOwnerMSCA({
          rpcClient,
          factoryAddress: "0xFD14c78640d72f73CC88238E2f7Df3273Ee84043", // MSCA factory address
          owner: provider.account.owner,
          index: 0n,
          chain: provider.chain,
        })
      ),
    };
  }

  /**
   * Encodes the transferOwnership function call using Light Account ABI.
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
        // light account does not support sub-accounts
        args: [await this.owner.getAddress(), 0n],
      }),
    ]);
  }
}
