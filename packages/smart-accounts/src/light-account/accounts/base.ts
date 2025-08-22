import {
  concat,
  concatHex,
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
  getUserOperationHash,
  toSmartAccount,
  type SmartAccount,
  type SmartAccountImplementation,
} from "viem/account-abstraction";
import { getStorageAt, signMessage, signTypedData } from "viem/actions";
import type {
  EntryPointFromAccountRegistry,
  LightAccountType,
  LightAccountVersion,
} from "../registry.js";
import { EIP1967_PROXY_IMPL_STORAGE_SLOT } from "../utils.js";
import { AccountVersionRegistry } from "../registry.js";
import { BaseError, lowerAddress } from "@alchemy/common";
import type {
  SignatureRequest,
  StaticSmartAccountImplementation,
} from "../../types.js";
import { getAction } from "viem/utils";

const SignaturePrefix = {
  EOA: "0x00",
  CONTRACT: "0x01",
  CONTRACT_WITH_ADDR: "0x02",
} as const;

export type BaseLightAccountImplementation<
  TLightAccountType extends LightAccountType = LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
> = SmartAccountImplementation<
  EntryPointFromAccountRegistry<TLightAccountType, TLightAccountVersion>["abi"],
  EntryPointFromAccountRegistry<
    TLightAccountType,
    TLightAccountVersion
  >["version"],
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

export type ToLightAccountBaseParams<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
  TTransport extends Transport = Transport,
> = {
  client: Client<TTransport, Chain, JsonRpcAccount | LocalAccount | undefined>;
  abi: Abi;
  accountAddress: Address;
  owner: JsonRpcAccount | LocalAccount;
  type: TLightAccountType;
  version: TLightAccountVersion;
  getFactoryArgs: () => Promise<{
    factory?: Address | undefined;
    factoryData?: Hex | undefined;
  }>;
};

export async function toLightAccountBase<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends
    LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
  TTransport extends Transport = Transport,
>({
  client,
  abi,
  accountAddress,
  owner,
  type,
  version,
  getFactoryArgs,
}: ToLightAccountBaseParams<
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
    const expectedImplAddresses = (
      Object.values(
        AccountVersionRegistry[type],
      ) as StaticSmartAccountImplementation<false>[]
    ).map((x) => x.accountImplementation);

    const getStorageAtAction = getAction(client, getStorageAt, "getStorageAt");
    // TODO(v5): This is a super fragile workflow, and we should consider not supporting this on the SmartAccount level in v5.
    const storage = await getStorageAtAction({
      address: accountAddress,
      slot: EIP1967_PROXY_IMPL_STORAGE_SLOT,
    });

    if (storage == null) {
      throw new BaseError(
        `Failed to get storage slot: ${EIP1967_PROXY_IMPL_STORAGE_SLOT}`,
      );
    }

    // Only upgrade undeployed accounts (storage 0) or deployed light accounts, else error.
    if (
      fromHex(storage, "number") !== 0 &&
      !expectedImplAddresses.some((x) => x === lowerAddress(trim(storage)))
    ) {
      throw new BaseError(
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
      // EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)
      // https://github.com/alchemyplatform/light-account/blob/main/src/LightAccount.sol#L236
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
        throw new BaseError(
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
        throw new BaseError(
          `Unknown version ${String(version)} of LightAccount`,
        );
    }
  };

  const formatSignature = async (signature: Hex): Promise<Hex> => {
    return version === "v2.0.0"
      ? concat([SignaturePrefix.EOA, signature])
      : signature;
  };

  const entryPoint = (
    AccountVersionRegistry[type][version] as StaticSmartAccountImplementation
  ).entryPoint;

  return await toSmartAccount({
    getFactoryArgs,
    client,
    entryPoint,

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

      switch (version) {
        case "v1.0.1":
        case "v1.0.2":
        case "v1.1.0":
          return signature;
        case "v2.0.0":
          return concat([SignaturePrefix.EOA, signature]);
        default:
          throw new BaseError(`Unknown version ${type} of ${String(version)}`);
      }
    },

    async signMessage({ message }) {
      const signMessageAction = getAction(client, signMessage, "signMessage");
      const signTypedDataAction = getAction(
        client,
        signTypedData,
        "signTypedData",
      );

      const { type, data } = await prepareSignature({
        type: "personal_sign",
        data: message,
      });

      const sig =
        type === "eth_signTypedData_v4"
          ? await signTypedDataAction({
              ...data,
              account: owner,
            })
          : await signMessageAction({ account: owner, message });

      return formatSignature(sig);
    },

    async signTypedData(params) {
      const signMessageAction = getAction(client, signMessage, "signMessage");
      const signTypedDataAction = getAction(
        client,
        signTypedData,
        "signTypedData",
      );

      const { type, data } = await prepareSignature({
        type: "eth_signTypedData_v4",
        data: params as TypedDataDefinition,
      });

      const sig =
        type === "eth_signTypedData_v4"
          ? await signTypedDataAction({
              ...data,
              account: owner,
            })
          : await signMessageAction({ account: owner, message: data });

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

      const signMessageAction = getAction(client, signMessage, "signMessage");

      const signature = await signMessageAction({
        account: owner,
        message: { raw: userOpHash },
      });

      return version === "v2.0.0"
        ? concatHex([SignaturePrefix.EOA, signature])
        : signature;
    },

    extend: {
      source: type,
      getLightAccountVersion: () => version,
      encodeUpgradeToAndCall,
      prepareSignature,
      formatSignature,
    },
  });
}
