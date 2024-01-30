import {
  getAccountAddress,
  getDefaultEntryPointAddress,
  toSmartContractAccount,
  type Address,
  type Hex,
  type OwnedSmartContractAccount,
  type PublicErc4337Client,
  type SmartAccountSigner,
  type UpgradeToAndCallParams,
} from "@alchemy/aa-core";
import {
  concatHex,
  encodeFunctionData,
  fromHex,
  hashMessage,
  hashTypedData,
  trim,
  type SignTypedDataParameters,
  type Transport,
} from "viem";
import { LightAccountAbi } from "./abis/LightAccountAbi.js";
import { LightAccountFactoryAbi } from "./abis/LightAccountFactoryAbi.js";
import { getLightAccountVersion } from "./getLightAccountVersion.js";
import {
  LightAccountUnsupported1271Factories,
  LightAccountVersions,
  getDefaultLightAccountFactoryAddress,
  type LightAccountVersion,
} from "./utils.js";

export type LightAccount<
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = OwnedSmartContractAccount<"LightAccount", TOwner> & {
  getLightAccountVersion: () => Promise<LightAccountVersion>;
  encodeTransferOwnership: (newOwner: Address) => Hex;
  getOwnerAddress: () => Promise<Address>;
  setOwner: <TOwner extends SmartAccountSigner = SmartAccountSigner>(
    newOwner: TOwner
  ) => void;
};

export type CreateLightAccountParams<
  TTransport extends Transport = Transport,
  TOwner extends SmartAccountSigner = SmartAccountSigner
> = {
  client: PublicErc4337Client<TTransport>;
  owner: TOwner;
  index?: bigint;
  factoryAddress?: Address;
  entrypointAddress?: Address;
  accountAddress?: Address;
  initCode?: Hex;
  version?: LightAccountVersion;
};

export async function createLightAccount<
  TTransport extends Transport = Transport,
  TOwner extends SmartAccountSigner = SmartAccountSigner
>(
  config: CreateLightAccountParams<TTransport, TOwner>
): Promise<LightAccount<TOwner>>;

export async function createLightAccount({
  client,
  owner: owner_,
  accountAddress,
  initCode,
  version = "v1.1.0",
  entrypointAddress = getDefaultEntryPointAddress(client.chain),
  factoryAddress = getDefaultLightAccountFactoryAddress(client.chain, version),
  index: index_ = 0n,
}: CreateLightAccountParams): Promise<LightAccount> {
  let owner = owner_;
  const getAccountInitCode = async () => {
    if (initCode) return initCode;

    const index = LightAccountUnsupported1271Factories.has(
      factoryAddress.toLowerCase() as Address
    )
      ? 0n
      : index_;

    return concatHex([
      factoryAddress,
      encodeFunctionData({
        abi: LightAccountFactoryAbi,
        functionName: "createAccount",
        args: [await owner.getAddress(), index],
      }),
    ]);
  };

  const address = await getAccountAddress({
    client,
    entrypointAddress,
    accountAddress,
    getAccountInitCode,
  });

  const encodeUpgradeToAndCall = async ({
    upgradeToAddress,
    upgradeToInitData,
  }: UpgradeToAndCallParams): Promise<Hex> => {
    const storage = await client.getStorageAt({
      address,
      // the slot at which impl addresses are stored by UUPS
      slot: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    });

    if (storage == null) {
      throw new Error("could not get storage");
    }

    const implementationAddresses = Object.values(LightAccountVersions).map(
      (x) => x.implAddress
    );

    // only upgrade undeployed accounts (storage 0) or deployed light accounts, error otherwise
    if (
      fromHex(storage, "number") !== 0 &&
      !implementationAddresses.some((x) => x === trim(storage))
    ) {
      throw new Error(
        "could not determine if smart account implementation is light account"
      );
    }

    return encodeFunctionData({
      abi: LightAccountAbi,
      functionName: "upgradeToAndCall",
      args: [upgradeToAddress, upgradeToInitData],
    });
  };

  const signWith1271Wrapper = async (msg: Hex): Promise<`0x${string}`> => {
    return owner.signTypedData({
      // EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)
      // https://github.com/alchemyplatform/light-account/blob/main/src/LightAccount.sol#L236
      domain: {
        chainId: Number(client.chain.id),
        name: "LightAccount",
        verifyingContract: address,
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

  const account = await toSmartContractAccount({
    client,
    entrypointAddress,
    accountAddress: address,
    source: "LightAccount",
    getAccountInitCode,
    encodeExecute: async ({ target, data, value }) => {
      return encodeFunctionData({
        abi: LightAccountAbi,
        functionName: "execute",
        args: [target, value ?? 0n, data],
      });
    },
    encodeBatchExecute: async (txs) => {
      const [targets, values, datas] = txs.reduce(
        (accum, curr) => {
          accum[0].push(curr.target);
          accum[1].push(curr.value ?? 0n);
          accum[2].push(curr.data);

          return accum;
        },
        [[], [], []] as [Address[], bigint[], Hex[]]
      );
      return encodeFunctionData({
        abi: LightAccountAbi,
        functionName: "executeBatch",
        args: [targets, values, datas],
      });
    },
    signUserOperationHash: async (uoHash: Hex) => {
      return owner.signMessage(uoHash);
    },
    async signMessage({ message }) {
      const version = await getLightAccountVersion(account);
      switch (version) {
        case "v1.0.1":
          return owner.signMessage(
            typeof message === "string" ? message : message.raw
          );
        case "v1.0.2":
          throw new Error(
            `Version ${version} of LightAccount doesn't support 1271`
          );
        default:
          return signWith1271Wrapper(hashMessage(message));
      }
    },
    async signTypedData(params) {
      const version = await getLightAccountVersion(account);
      switch (version) {
        case "v1.0.1": {
          return owner.signTypedData(
            params as unknown as SignTypedDataParameters
          );
        }
        case "v1.0.2":
          throw new Error(
            `Version ${version} of LightAccount doesn't support 1271`
          );
        default:
          return signWith1271Wrapper(hashTypedData(params));
      }
    },
    getDummySignature: () => {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
    },
    encodeUpgradeToAndCall,
  });

  return {
    ...account,
    source: "LightAccount",
    getLightAccountVersion: async () => getLightAccountVersion(account),
    encodeTransferOwnership: (newOwner: Address) => {
      return encodeFunctionData({
        abi: LightAccountAbi,
        functionName: "transferOwnership",
        args: [newOwner],
      });
    },
    async getOwnerAddress(): Promise<Address> {
      const callResult = await client.readContract({
        address,
        abi: LightAccountAbi,
        functionName: "owner",
      });

      if (callResult == null) {
        throw new Error("could not get on-chain owner");
      }

      if (callResult !== (await owner.getAddress())) {
        throw new Error("on-chain owner does not match account owner");
      }

      return callResult;
    },
    getOwner: () => owner,
    setOwner: <TOwner extends SmartAccountSigner = SmartAccountSigner>(
      newOwner: TOwner
    ) => {
      owner = newOwner;
    },
  };
}
