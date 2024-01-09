import {
  SimpleSmartContractAccount,
  type ISmartAccountProvider,
  type SignTypedDataParams,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import {
  concatHex,
  decodeFunctionResult,
  encodeFunctionData,
  fromHex,
  hashMessage,
  hashTypedData,
  isBytes,
  trim,
  type Address,
  type Chain,
  type FallbackTransport,
  type Hash,
  type Hex,
  type Transport,
} from "viem";
import { createMultiOwnerMSCA } from "../msca/multi-owner-account.js";
import { getDefaultMultiOwnerMSCAFactoryAddress } from "../msca/utils.js";
import { LightAccountAbi } from "./abis/LightAccountAbi.js";
import { LightAccountFactoryAbi } from "./abis/LightAccountFactoryAbi.js";
import {
  LightAccountUnsupported1271Factories,
  LightAccountVersions,
  type LightAccountVersion,
} from "./utils.js";

export class LightSmartContractAccount<
  TTransport extends Transport | FallbackTransport = Transport
> extends SimpleSmartContractAccount<TTransport> {
  override async signMessage(msg: string | Uint8Array): Promise<`0x${string}`> {
    const version = await this.getLightAccountVersion();
    switch (version) {
      case "v1.0.1":
        return this.owner.signMessage(msg);
      case "v1.0.2":
        throw new Error(
          `Version ${version} of LightAccount doesn't support 1271`
        );
      default:
        return this.signWith1271Wrapper(
          hashMessage(
            typeof msg === "string" && !isBytes(msg)
              ? msg
              : {
                  raw: msg,
                }
          )
        );
    }
  }

  override async signTypedData(
    params: SignTypedDataParams
  ): Promise<`0x${string}`> {
    const version = await this.getLightAccountVersion();
    switch (version) {
      case "v1.0.1":
        return this.owner.signTypedData(params);
      case "v1.0.2":
        throw new Error(
          `Version ${version} of LightAccount doesn't support 1271`
        );
      default:
        return this.signWith1271Wrapper(hashTypedData(params));
    }
  }

  override async signUserOperationHash(
    uoHash: `0x${string}`
  ): Promise<`0x${string}`> {
    return this.owner.signMessage(uoHash);
  }

  public getLightAccountVersion = async (): Promise<LightAccountVersion> => {
    const implAddress = await this.getImplementationAddress();
    const implToVersion = new Map(
      Object.entries(LightAccountVersions).map(([key, value]) => [
        value.implAddress,
        key as LightAccountVersion,
      ])
    );
    const factoryToVersion = new Map(
      Object.entries(LightAccountVersions).map(([key, value]) => [
        value.factoryAddress,
        key as LightAccountVersion,
      ])
    );

    const version =
      implAddress === "0x0"
        ? factoryToVersion.get(this.factoryAddress)
        : implToVersion.get(implAddress);

    if (!version) {
      throw new Error("Could not determine LightAccount version");
    }

    return version;
  };

  private signWith1271Wrapper = async (msg: Hash): Promise<`0x${string}`> => {
    return this.owner.signTypedData({
      // EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)
      // https://github.com/alchemyplatform/light-account/blob/main/src/LightAccount.sol#L236
      domain: {
        chainId: Number(this.rpcProvider.chain.id),
        name: "LightAccount",
        verifyingContract: await this.getAddress(),
        version: "1",
      },
      types: {
        LightAccountMessage: [{ name: "message", type: "bytes" }],
      },
      message: {
        message: msg,
      },
      primaryType: "LightAccountMessage",
    });
  };

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

  /**
   * Upgrades the account implementation from Light Account to a Modular Account.
   * Optionally waits for the transaction to be mined.
   *
   * @param provider - the provider to use to send the transaction
   * @param chain - the chain to upgrade the account on
   * @param accountImplAddress - the address of the smart account implementation to
   * upgrade to
   * @param initializationData - the initialization data address to use when upgrading to the new
   * smart account
   * @param waitForTxn - whether or not to wait for the transaction to be mined
   * @returns {
   *  provider: SmartAccountProvider<TTransport> & { account: MSCA };
   *  hash: Hash;
   * } - the upgraded provider and corresponding userOperation hash,
   * or transaction hash if `waitForTxn` is true
   */
  static async upgrade<
    P extends ISmartAccountProvider,
    TTransport extends Transport | FallbackTransport = Transport
  >(
    provider: P & {
      account: LightSmartContractAccount<TTransport>;
    },
    chain: Chain,
    accountImplAddress: Address,
    initializationData: Hex,
    waitForTxn: boolean = false
  ) {
    const accountAddress = await provider.getAddress();

    const storage = await provider.rpcClient.getStorageAt({
      address: accountAddress,
      slot: LightSmartContractAccount.storageSlot,
    });

    if (storage == null) {
      throw new Error("could not get storage");
    }

    // only upgrade undeployed accounts (storage 0) or deployed light accounts, error otherwise
    if (
      fromHex(storage, "number") !== 0 &&
      trim(storage) !== LightSmartContractAccount.implementationAddress
    ) {
      throw new Error(
        "could not determine if smart account implementation is light account"
      );
    }

    const encodeUpgradeData = encodeFunctionData({
      abi: LightAccountAbi,
      functionName: "upgradeToAndCall",
      args: [accountImplAddress, initializationData],
    });

    const result = await provider.sendUserOperation({
      target: accountAddress,
      data: encodeUpgradeData,
    });

    let hash = result.hash;
    if (waitForTxn) {
      hash = await provider.waitForUserOperationTransaction(result.hash);
    }

    const owner = provider.account.getOwner();
    if (owner == null) {
      throw new Error("could not get owner");
    }

    return {
      provider: provider.connect((rpcClient) =>
        createMultiOwnerMSCA({
          rpcClient,
          factoryAddress: getDefaultMultiOwnerMSCAFactoryAddress(chain),
          owner,
          index: 0n,
          chain: chain,
          accountAddress,
        })
      ),
      hash,
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
    P extends ISmartAccountProvider,
    TTransport extends Transport | FallbackTransport = Transport
  >(
    provider: P & {
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
    const index = LightAccountUnsupported1271Factories.has(this.factoryAddress)
      ? 0n
      : this.index;

    return concatHex([
      this.factoryAddress,
      encodeFunctionData({
        abi: LightAccountFactoryAbi,
        functionName: "createAccount",
        args: [await this.owner.getAddress(), index],
      }),
    ]);
  }
}
