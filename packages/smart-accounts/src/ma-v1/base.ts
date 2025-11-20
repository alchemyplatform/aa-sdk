import {
  type Address,
  type Chain,
  type Client,
  type Hex,
  type JsonRpcAccount,
  type LocalAccount,
  type Transport,
  type Hash,
  type TypedDataDefinition,
  encodeFunctionData,
} from "viem";
import {
  entryPoint06Abi,
  toSmartAccount,
  type SmartAccount,
  type SmartAccountImplementation,
  entryPoint06Address,
  getUserOperationHash,
} from "viem/account-abstraction";
import type { SignatureRequest } from "../types.js";
import { IStandardExecutorAbi } from "./abis/IStandardExecutor.js";
import { signMessage, signTypedData } from "viem/actions";
import {
  decodeFunctionData,
  getAction,
  hashMessage,
  hashTypedData,
  isAddressEqual,
} from "viem/utils";
import { BaseError } from "@alchemy/common";

type MaV1AccountType = "MultiOwnerModularAccountV1"; // Currently no SDK v5 support for "MultiSigModularAccountV1".

export type BaseMaV1AccountImplementation = SmartAccountImplementation<
  typeof entryPoint06Abi,
  "0.6",
  {
    source: MaV1AccountType;
    prepareSignature: (request: SignatureRequest) => Promise<SignatureRequest>;
    formatSignature: (signature: Hex) => Promise<Hex>;
  },
  false
>;

export type ModularAccountV1Base = SmartAccount<BaseMaV1AccountImplementation>;

export type ToModularAccountV1BaseParams<
  TTransport extends Transport = Transport,
> = {
  client: Client<TTransport, Chain, JsonRpcAccount | LocalAccount | undefined>;
  accountAddress: Address;
  owner: JsonRpcAccount | LocalAccount;
  getFactoryArgs: () => Promise<{
    factory?: Address | undefined;
    factoryData?: Hex | undefined;
  }>;
  get712Wrapper: (msg: Hash) => Promise<TypedDataDefinition>;
  type: MaV1AccountType;
};

// TODO(jh): write tests for this.
export async function toModularAccountV1Base<
  TTransport extends Transport = Transport,
>({
  client,
  accountAddress,
  owner,
  getFactoryArgs,
  get712Wrapper,
  type,
}: ToModularAccountV1BaseParams<TTransport>): Promise<ModularAccountV1Base> {
  const entryPoint = {
    abi: entryPoint06Abi,
    address: entryPoint06Address,
    version: "0.6" as const,
  };

  const prepareSignature = async (
    params: SignatureRequest,
  ): Promise<SignatureRequest> => {
    const data = await get712Wrapper(
      params.type === "personal_sign"
        ? hashMessage(params.data)
        : hashTypedData(params.data),
    );
    return {
      type: "eth_signTypedData_v4",
      data,
    };
  };

  const formatSignature = async (signature: Hex): Promise<Hex> => {
    return signature;
  };

  return await toSmartAccount({
    getFactoryArgs,
    client,
    entryPoint,

    async getAddress() {
      return accountAddress;
    },

    async encodeCalls(calls) {
      if (!calls.length) {
        throw new BaseError("No calls to encode.");
      }

      if (calls.length === 1) {
        const call = calls[0];

        if (isAddressEqual(call.to, accountAddress)) {
          // If the call is to the account itself, we need to avoid wrapping it in an `execute` call.

          if (call.data == null) {
            throw new BaseError("Data is required for an account self-call.");
          }

          return call.data;
        }

        return encodeFunctionData({
          abi: IStandardExecutorAbi,
          functionName: "execute",
          args: [call.to, call.value ?? 0n, call.data ?? "0x"],
        });
      }

      return encodeFunctionData({
        abi: IStandardExecutorAbi,
        functionName: "executeBatch",
        args: [
          calls.map((call) => ({
            target: call.to,
            value: call.value ?? 0n,
            data: call.data ?? "0x",
          })),
        ],
      });
    },

    // Inverse of `encodeCalls`.
    async decodeCalls(data) {
      const decoded = decodeFunctionData({
        abi: IStandardExecutorAbi,
        data,
      });

      if (decoded.functionName === "execute") {
        return [
          {
            to: decoded.args[0],
            value: decoded.args[1],
            data: decoded.args[2],
          },
        ];
      }

      if (decoded.functionName === "executeBatch") {
        return decoded.args[0].map((call) => ({
          to: call.target,
          value: call.value,
          data: call.data,
        }));
      }

      // If the data is not for an `execute` or `executeBatch` call, we treat it as a single call to the account itself.
      return [
        {
          to: accountAddress,
          data,
        },
      ];
    },

    async getStubSignature() {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
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
      return type === "personal_sign"
        ? signMessageAction({ account: owner, message: data })
        : signTypedDataAction({ ...data, account: owner });
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
        data: params as TypedDataDefinition, // TODO(v5): try harder to avoid this cast?
      });
      return type === "personal_sign"
        ? signMessageAction({ account: owner, message: data })
        : signTypedDataAction({ ...data, account: owner });
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
      return signMessageAction({
        account: owner,
        message: {
          raw: userOpHash,
        },
      });
    },

    extend: {
      source: type,
      prepareSignature,
      formatSignature,
    },
  });
}
