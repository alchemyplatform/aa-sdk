import type { SignatureRequest } from "@aa-sdk/core";
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
  type Client,
  type Hex,
  type JsonRpcAccount,
  type LocalAccount,
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
import { getStorageAt, signMessage, signTypedData } from "viem/actions";
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
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
> = SmartAccountImplementation<
  ["0.6"] extends LightAccountEntryPointVersion<
    TLightAccountType,
    TLightAccountVersion
  >
    ? typeof entryPoint06Abi
    : typeof entryPoint07Abi,
  LightAccountEntryPointVersion<TLightAccountType, TLightAccountVersion>,
  {
    getLightAccountVersion: () => TLightAccountVersion;
    source: TLightAccountType;
    encodeUpgradeToAndCall: (params: {
      upgradeToAddress: Address;
      upgradeToInitData: Hex;
    }) => Promise<Hex>;
    prepareSignature: (request: SignatureRequest) => Promise<SignatureRequest>;
    formatSignature: (signature: Hex) => Promise<Hex>;
  },
  false
>;

export type LightAccountBase<
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
> = SmartAccount<
  BaseLightAccountImplementation<TLightAccountType, TLightAccountVersion>
>;

export type CreateLightAccountBaseParams<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
  TTransport extends Transport = Transport,
> = {
  client: Client<TTransport, Chain, JsonRpcAccount | LocalAccount>;
  abi: Abi;
  accountAddress: Address;
  type: TLightAccountType;
  version: TLightAccountVersion;
  getFactoryArgs: () => Promise<{
    factory?: Address | undefined;
    factoryData?: Hex | undefined;
  }>;
};

export async function createLightAccountBase<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
  TTransport extends Transport = Transport,
>({
  client,
  abi,
  version,
  type,
  accountAddress,
  getFactoryArgs,
}: CreateLightAccountBaseParams<
  TLightAccountType,
  TLightAccountVersion,
  TTransport
>): Promise<LightAccountBase<TLightAccountType, TLightAccountVersion>> {
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
    params: SignatureRequest,
  ): Promise<SignatureRequest> => {
    const messageHash =
      params.type === "eth_signTypedData_v4"
        ? hashTypedData(params.data)
        : hashMessage(params.data);

    switch (version) {
      case "v1.0.1":
        return params;
      case "v1.0.2":
        throw new Error(
          `Version ${String(version)} of LightAccount doesn't support 1271`,
        );
      case "v1.1.0":
        return {
          type: "eth_signTypedData_v4",
          data: get1271Wrapper(messageHash, "1"),
        };
      case "v2.0.0":
        return {
          type: "eth_signTypedData_v4",
          data: get1271Wrapper(messageHash, "2"),
        };
      default:
        throw new Error(`Unknown version ${String(version)} of LightAccount`);
    }
  };

  const formatSignature = async (signature: Hex): Promise<Hex> => {
    return version === "v2.0.0"
      ? concat([SignatureType.EOA, signature])
      : signature;
  };

  const entryPointVersion = (AccountVersionRegistry[type][version] as any)
    .entryPointVersion;

  const entryPoint = {
    abi: entryPointVersion === "0.6" ? entryPoint06Abi : entryPoint07Abi,
    address:
      // TODO(v5): make these constants elsewhere
      entryPointVersion === "0.6"
        ? ("0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789" as Address)
        : ("0x0000000071727De22E5E9d8BAf0edAc6f37da032" as Address),
    version: entryPointVersion === "0.6" ? ("0.6" as const) : ("0.7" as const),
  };

  return await toSmartAccount({
    getFactoryArgs,
    client,
    entryPoint: entryPoint as BaseLightAccountImplementation<
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
      const { type, data } = await prepareSignature({
        type: "personal_sign",
        data: message,
      });

      const sig =
        type === "eth_signTypedData_v4"
          ? await signTypedData(client, data)
          : await signMessage(client, { message });

      return formatSignature(sig);
    },

    async signTypedData(params) {
      const { type, data } = await prepareSignature({
        type: "eth_signTypedData_v4",
        data: params as TypedDataDefinition,
      });

      const sig =
        type === "eth_signTypedData_v4"
          ? await signTypedData(client, data)
          : await signMessage(client, { message: data });

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

      const signature = await signMessage(client, {
        message: { raw: userOpHash },
      });

      return version === "v2.0.0"
        ? concat([SignatureType.EOA, signature])
        : signature;
    },

    // Extension properties
    extend: {
      source: type,
      getLightAccountVersion: () => version,
      encodeUpgradeToAndCall,
      prepareSignature,
      formatSignature,
    },
  });
}
