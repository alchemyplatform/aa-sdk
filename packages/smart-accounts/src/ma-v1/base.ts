import {
  type Abi,
  type Address,
  type Chain,
  type Client,
  type Hex,
  type JsonRpcAccount,
  type LocalAccount,
  type Transport,
} from "viem";
import {
  entryPoint06Abi,
  toSmartAccount,
  type SmartAccount,
  type SmartAccountImplementation,
  entryPoint06Address,
} from "viem/account-abstraction";
import type { SignatureRequest } from "../types.js";

export type BaseMaV1AccountImplementation = SmartAccountImplementation<
  typeof entryPoint06Abi,
  "0.6",
  {
    source: "ModularAccountV1";
    prepareSignature: (request: SignatureRequest) => Promise<SignatureRequest>;
    formatSignature: (signature: Hex) => Promise<Hex>;
    // TODO(jh): maybe want things like encodeCallData and getExecutionData?
  },
  false
>;

export type ModularAccountV1Base = SmartAccount<BaseMaV1AccountImplementation>;

export type ToModularAccountV1BaseParams<
  TTransport extends Transport = Transport,
> = {
  client: Client<TTransport, Chain, JsonRpcAccount | LocalAccount | undefined>;
  abi: Abi;
  accountAddress: Address;
  owner: JsonRpcAccount | LocalAccount; // TODO(jh): is this ok for multi-owner? seem okay in LA?
  getFactoryArgs: () => Promise<{
    factory?: Address | undefined;
    factoryData?: Hex | undefined;
  }>;
};

export async function toModularAccountV1Base<
  TTransport extends Transport = Transport,
>({
  client,
  abi,
  accountAddress,
  owner,
  getFactoryArgs,
}: ToModularAccountV1BaseParams<TTransport>): Promise<ModularAccountV1Base> {
  const entryPoint = {
    abi: entryPoint06Abi,
    address: entryPoint06Address,
    version: "0.6" as const,
  };

  const prepareSignature = async (
    params: SignatureRequest,
  ): Promise<SignatureRequest> => {
    throw new Error("Not implemented"); // TODO(jh): impl
  };

  const formatSignature = async (signature: Hex): Promise<Hex> => {
    throw new Error("Not implemented"); // TODO(jh): impl
  };

  return await toSmartAccount({
    getFactoryArgs,
    client,
    entryPoint,

    async getAddress() {
      return accountAddress;
    },

    async encodeCalls(calls) {
      throw new Error("Not implemented"); // TODO(jh): impl
    },

    async getStubSignature() {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
    },

    async signMessage({ message }) {
      throw new Error("Not implemented"); // TODO(jh): impl
    },

    async signTypedData(params) {
      throw new Error("Not implemented"); // TODO(jh): impl
    },

    async signUserOperation(parameters) {
      throw new Error("Not implemented"); // TODO(jh): impl
    },

    extend: {
      source: "ModularAccountV1" as const,
      prepareSignature,
      formatSignature,
      // TODO(jh): if you add anything above, be sure to add it here too.
    },
  });
}
