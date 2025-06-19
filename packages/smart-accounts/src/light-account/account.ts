import { type SmartAccountSigner } from "@aa-sdk/core";
import {
  encodeFunctionData,
  type Address,
  type Chain,
  type Hex,
  type PublicClient,
  type Transport,
} from "viem";
import { readContract } from "viem/actions";
import { LightAccountAbi_v1 } from "./abis/LightAccountAbi_v1.js";
import { LightAccountAbi_v2 } from "./abis/LightAccountAbi_v2.js";
import { LightAccountFactoryAbi_v1 } from "./abis/LightAccountFactoryAbi_v1.js";
import { LightAccountFactoryAbi_v2 } from "./abis/LightAccountFactoryAbi_v2.js";
import {
  createLightAccountBase,
  type LightAccountBase,
} from "./base-account.js";
import { predictLightAccountAddress } from "./predictAddress.js";
import type { LightAccountVersion } from "./types.js";
import {
  LightAccountUnsupported1271Factories,
  defaultLightAccountVersion,
  getDefaultLightAccountFactoryAddress,
} from "./utils.js";

export type LightAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends
    LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
> = LightAccountBase<TSigner, "LightAccount", TLightAccountVersion> & {
  encodeTransferOwnership: (newOwner: Address) => Hex;
  getOwnerAddress: () => Promise<Address>;
};

export type CreateLightAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends
    LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
> = {
  client: PublicClient<TTransport, Chain>;
  signer: TSigner;
  salt?: bigint;
  accountAddress?: Address;
  factoryAddress?: Address;
  version?: TLightAccountVersion;
};

export async function createLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
  TLightAccountVersion extends LightAccountVersion<"LightAccount"> = "v2.0.0",
>({
  client,
  signer,
  salt: salt_ = 0n,
  accountAddress,
  factoryAddress,
  version = defaultLightAccountVersion() as TLightAccountVersion,
}: CreateLightAccountParams<
  TTransport,
  TSigner,
  TLightAccountVersion
>): Promise<LightAccount<TSigner, TLightAccountVersion>> {
  const accountAbi =
    version === "v2.0.0" ? LightAccountAbi_v2 : LightAccountAbi_v1;
  const factoryAbi =
    version === "v2.0.0"
      ? LightAccountFactoryAbi_v2
      : LightAccountFactoryAbi_v1;

  const signerAddress = await signer.getAddress();
  const finalFactoryAddress =
    factoryAddress ??
    getDefaultLightAccountFactoryAddress(client.chain, version);

  const salt = LightAccountUnsupported1271Factories.has(
    finalFactoryAddress.toLowerCase() as Address
  )
    ? 0n
    : salt_;

  const address =
    accountAddress ??
    predictLightAccountAddress({
      factoryAddress: finalFactoryAddress,
      salt,
      ownerAddress: signerAddress,
      version,
    });

  const getFactoryArgs = async () => {
    const factoryData = encodeFunctionData({
      abi: factoryAbi,
      functionName: "createAccount",
      args: [signerAddress, salt],
    });

    return {
      factory: finalFactoryAddress,
      factoryData,
    };
  };

  const baseAccount = await createLightAccountBase({
    client,
    abi: accountAbi,
    signer,
    accountAddress: address,
    type: "LightAccount",
    version,
    getFactoryArgs,
  });

  return {
    ...baseAccount,

    encodeTransferOwnership: (newOwner: Address) => {
      return encodeFunctionData({
        abi: accountAbi,
        functionName: "transferOwnership",
        args: [newOwner],
      });
    },

    async getOwnerAddress(): Promise<Address> {
      const callResult = await readContract(client, {
        address,
        abi: accountAbi,
        functionName: "owner",
      });

      if (callResult == null) {
        throw new Error("could not get on-chain owner");
      }

      return callResult as Address;
    },
  };
}
