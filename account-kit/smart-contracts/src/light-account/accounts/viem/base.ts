import {
  deepHexlify,
  type EntryPointDef,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import {
  concat,
  createPublicClient,
  encodeFunctionData,
  hashMessage,
  hashTypedData,
  type Abi,
  type Address,
  type Chain,
  type Hex,
  type Transport,
} from "viem";
import { toSmartAccount, type SmartAccount } from "viem/account-abstraction";
import { SignatureType } from "../../../ma-v2/modules/utils.js";
import type {
  LightAccountEntryPointVersion,
  LightAccountType,
  LightAccountVersion,
} from "../../types";

export type CreateBaseViemLightAccountParams<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
> = {
  transport: TTransport;
  chain: Chain;
  signer: TSigner;
  abi: Abi;
  factoryAbi: Abi;
  version: TLightAccountVersion;
  type: TLightAccountType;
  entryPoint: EntryPointDef<
    LightAccountEntryPointVersion<TLightAccountType, TLightAccountVersion>,
    Chain
  >;
  getAddress: () => Promise<Address>;
  getFactoryArgs: () => Promise<{
    factory: Address;
    factoryData: Hex;
  }>;
};
// TODO: define the implementation and return type for the base account

// TODO: the return type isn't quite correct here, we can do better following this as an example https://github.com/wevm/viem/blob/main/src/account-abstraction/accounts/implementations/toSoladySmartAccount.ts
export async function createBaseViemLightAccount<
  TLightAccountType extends LightAccountType,
  TLightAccountVersion extends LightAccountVersion<TLightAccountType> = LightAccountVersion<TLightAccountType>,
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner
>(
  params: CreateBaseViemLightAccountParams<
    TLightAccountType,
    TLightAccountVersion,
    TTransport,
    TSigner
  >
): Promise<SmartAccount> {
  const {
    version,
    signer,
    abi,
    type,
    entryPoint,
    transport,
    chain,
    getAddress,
    getFactoryArgs,
  } = params;
  const client = createPublicClient({
    transport,
    chain,
  });

  const signWith1271Wrapper = async (
    hashedMessage: Hex,
    version: string
  ): Promise<Hex> => {
    return signer.signTypedData({
      // EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)
      // https://github.com/alchemyplatform/light-account/blob/main/src/LightAccount.sol#L236
      domain: {
        chainId: Number(client.chain.id),
        name: type,
        verifyingContract: await getAddress(),
        version,
      },
      types: {
        LightAccountMessage: [{ name: "message", type: "bytes" }],
      },
      message: {
        message: hashedMessage,
      },
      primaryType: "LightAccountMessage",
    });
  };

  return toSmartAccount({
    client,
    extend: {
      abi,
    },
    entryPoint: {
      abi: entryPoint.abi,
      address: entryPoint.address,
      version:
        entryPoint.version === "0.6.0"
          ? "0.6"
          : entryPoint.version === "0.7.0"
          ? "0.7"
          : (() => {
              throw new Error("Invalid entry point version");
            })(),
    },
    async sign({ hash }) {
      if (version === "v1.0.1" || version === "v1.0.2") {
        throw new Error(`${type} ${String(version)} doesn't support 1271`);
      }

      switch (version as string) {
        case "v1.1.0":
          return await signWith1271Wrapper(hash, "1");
        case "v2.0.0":
          const signature = await signWith1271Wrapper(hash, "2");
          // TODO: handle case where signer is an SCA.
          return concat([SignatureType.EOA, signature]);
        default:
          throw new Error(`Unknown version ${type} of ${String(version)}`);
      }
    },
    async signMessage({ message }) {
      return this.sign!({ hash: hashMessage(message) });
    },
    async signTypedData(params) {
      return this.sign!({ hash: hashTypedData(params) });
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
    async signUserOperation(parameters) {
      const hash = entryPoint.getUserOperationHash(deepHexlify(parameters));

      return signer.signMessage({ raw: hash });
    },
    async encodeCalls(calls) {
      if (calls.length === 1) {
        const call = calls[0];
        return encodeFunctionData({
          abi,
          functionName: "execute",
          args: [call.to, call.value ?? 0n, call.data],
        });
      }

      const [targets, values, datas] = calls.reduce(
        (accum, curr) => {
          accum[0].push(curr.to);
          accum[1].push(curr.value ?? 0n);
          accum[2].push(curr.data ?? "0x");

          return accum;
        },
        [[], [], []] as [Address[], bigint[], Hex[]]
      );
      return encodeFunctionData({
        abi,
        functionName: "executeBatch",
        args: [targets, values, datas],
      });
    },
    getAddress,
    getFactoryArgs,
  });
}
