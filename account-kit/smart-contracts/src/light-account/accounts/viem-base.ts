import { type EntryPointVersion, type SmartAccountSigner } from "@aa-sdk/core";
import {
  concat,
  encodeFunctionData,
  fromHex,
  hashMessage,
  hashTypedData,
  trim,
  type Abi,
  type Address,
  type Chain,
  type Hex,
  type PublicClient,
  type SignableMessage,
  type Transport,
  type TypedDataDefinition,
} from "viem";
import {
  entryPoint06Abi,
  entryPoint07Abi,
  getUserOperationHash,
  toSmartAccount,
  type SmartAccount,
  type SmartAccountImplementation,
} from "viem/account-abstraction";
import { getStorageAt } from "viem/actions";
import type {
  LightAccountEntryPointVersion,
  LightAccountType,
  LightAccountVersion,
} from "../types.js";
import { AccountVersionRegistry } from "../utils.js";

enum SignatureType {
  EOA = "0x00",
  CONTRACT = "0x01",
  CONTRACT_WITH_ADDR = "0x02",
}

export type BaseLightAccountImplementation<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
> = SmartAccountImplementation<
  ["0.6.0"] extends LightAccountEntryPointVersion<
    TLightAccountType,
    TLightAccountVersion
  >
    ? typeof entryPoint06Abi
    : typeof entryPoint07Abi,
  LightAccountEntryPointVersion<
    TLightAccountType,
    TLightAccountVersion
  > extends "0.6.0"
    ? "0.6"
    : "0.7",
  {
    getLightAccountVersion: () => TLightAccountVersion;
    getSigner: () => TSigner;
    source: TLightAccountType;
    encodeUpgradeToAndCall: (params: {
      upgradeToAddress: Address;
      upgradeToInitData: Hex;
    }) => Promise<Hex>;
  },
  false
>;

export type ViemLightAccountBase<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
> = SmartAccount<
  BaseLightAccountImplementation<
    TSigner,
    TLightAccountType,
    TLightAccountVersion
  >
>;

export type CreateViemLightAccountBaseParams<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = {
  client: PublicClient<TTransport, Chain>;
  signer: TSigner;
  abi: Abi;
  accountAddress: Address;
  type: TLightAccountType;
  version: TLightAccountVersion;
  getFactoryArgs: () => Promise<{
    factory?: Address | undefined;
    factoryData?: Hex | undefined;
  }>;
};

export async function createViemLightAccountBase<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
>({
  client,
  signer,
  abi,
  version,
  type,
  accountAddress,
  getFactoryArgs,
}: CreateViemLightAccountBaseParams<
  TLightAccountType,
  TLightAccountVersion,
  TTransport,
  TSigner
>): Promise<
  ViemLightAccountBase<TSigner, TLightAccountType, TLightAccountVersion>
> {
  const encodeUpgradeToAndCall = async ({
    upgradeToAddress,
    upgradeToInitData,
  }: {
    upgradeToAddress: Address;
    upgradeToInitData: Hex;
  }): Promise<Hex> => {
    const storage = await getStorageAt(client, {
      address: accountAddress,
      slot: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    });

    if (storage == null) {
      throw new Error(
        "Failed to get storage slot: 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
      );
    }

    const implementationAddresses = Object.values(
      AccountVersionRegistry[type],
    ).map(
      (x) =>
        x.addresses.overrides?.[client.chain.id]?.impl ??
        x.addresses.default.impl,
    );

    if (
      fromHex(storage, "number") !== 0 &&
      !implementationAddresses.some((x) => x === trim(storage))
    ) {
      throw new Error(
        `could not determine if smart account implementation is ${type} ${String(
          version,
        )}`,
      );
    }

    return encodeFunctionData({
      abi,
      functionName: "upgradeToAndCall",
      args: [upgradeToAddress, upgradeToInitData],
    });
  };

  const get1271Wrapper = (
    hashedMessage: Hex,
    version: string,
  ): TypedDataDefinition => {
    return {
      domain: {
        chainId: client.chain.id,
        name: type,
        verifyingContract: accountAddress,
        version,
      },
      types: {
        LightAccountMessage: [{ name: "message", type: "bytes" }],
      },
      message: {
        message: hashedMessage,
      },
      primaryType: "LightAccountMessage",
    };
  };

  const prepareSignature = async (
    message: SignableMessage | TypedDataDefinition,
    isTypedData: boolean = false,
  ): Promise<{
    shouldWrap: boolean;
    data: SignableMessage | TypedDataDefinition;
  }> => {
    const messageHash = isTypedData
      ? hashTypedData(message as TypedDataDefinition)
      : hashMessage(message as SignableMessage);

    switch (version) {
      case "v1.0.1":
        return { shouldWrap: false, data: message };
      case "v1.0.2":
        throw new Error(
          `Version ${String(version)} of LightAccount doesn't support 1271`,
        );
      case "v1.1.0":
        return { shouldWrap: true, data: get1271Wrapper(messageHash, "1") };
      case "v2.0.0":
        return { shouldWrap: true, data: get1271Wrapper(messageHash, "2") };
      default:
        throw new Error(`Unknown version ${String(version)} of LightAccount`);
    }
  };

  const formatSignature = (signature: Hex): Hex => {
    return version === "v2.0.0"
      ? concat([SignatureType.EOA, signature])
      : signature;
  };

  const entryPointVersion: EntryPointVersion = (
    AccountVersionRegistry[type][version] as any
  ).entryPointVersion;

  const entryPoint = {
    abi: entryPointVersion === "0.6.0" ? entryPoint06Abi : entryPoint07Abi,
    address:
      entryPointVersion === "0.6.0"
        ? ("0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789" as Address)
        : ("0x0000000071727De22E5E9d8BAf0edAc6f37da032" as Address),
    version:
      entryPointVersion === "0.6.0" ? ("0.6" as const) : ("0.7" as const),
  };

  return await toSmartAccount({
    getFactoryArgs,
    client,
    entryPoint: entryPoint as BaseLightAccountImplementation<
      TSigner,
      TLightAccountType,
      TLightAccountVersion
    >["entryPoint"],

    async getAddress() {
      return accountAddress;
    },

    async encodeCalls(calls) {
      if (calls.length === 1) {
        const call = calls[0];
        return encodeFunctionData({
          abi,
          functionName: "execute",
          args: [call.to, call.value ?? 0n, call.data ?? "0x"],
        });
      }

      const [targets, values, datas] = calls.reduce(
        (accum, curr) => {
          accum[0].push(curr.to);
          accum[1].push(curr.value ?? 0n);
          accum[2].push(curr.data ?? "0x");
          return accum;
        },
        [[], [], []] as [Address[], bigint[], Hex[]],
      );

      return encodeFunctionData({
        abi,
        functionName: "executeBatch",
        args: [targets, values, datas],
      });
    },

    async getStubSignature() {
      const signature =
        "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";

      switch (version as string) {
        case "v1.0.1":
        case "v1.0.2":
        case "v1.1.0":
          return signature;
        case "v2.0.0":
          return concat([SignatureType.EOA, signature]);
        default:
          throw new Error(`Unknown version ${type} of ${String(version)}`);
      }
    },

    async signMessage({ message }) {
      const { shouldWrap, data } = await prepareSignature(message, false);

      const sig = shouldWrap
        ? await signer.signTypedData(data as TypedDataDefinition)
        : await signer.signMessage(message);

      return formatSignature(sig);
    },

    async signTypedData(params) {
      const { shouldWrap, data } = await prepareSignature(
        params as TypedDataDefinition,
        true,
      );

      const sig = shouldWrap
        ? await signer.signTypedData(data as TypedDataDefinition)
        : await signer.signTypedData(params);

      return formatSignature(sig);
    },

    async signUserOperation(parameters) {
      const { chainId = client.chain.id, ...userOperation } = parameters;
      const userOpHash = getUserOperationHash({
        chainId,
        entryPointAddress: entryPoint.address,
        entryPointVersion: entryPoint.version,
        userOperation: {
          ...userOperation,
          sender: accountAddress,
        },
      });

      const signature = await signer.signMessage({ raw: userOpHash });

      switch (version) {
        case "v2.0.0":
          return concat([SignatureType.EOA, signature]);
        default:
          return signature;
      }
    },

    // Extension properties
    extend: {
      source: type,
      getLightAccountVersion: () => version,
      getSigner: () => signer,
      encodeUpgradeToAndCall,
    },
  });
}
