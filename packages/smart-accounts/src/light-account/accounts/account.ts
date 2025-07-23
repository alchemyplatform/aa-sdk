import {
  encodeFunctionData,
  type Address,
  type Chain,
  type Client,
  type Hex,
  type JsonRpcAccount,
  type LocalAccount,
  type Transport,
} from "viem";
import { readContract } from "viem/actions";
import { LightAccountAbi_v1 } from "../abis/LightAccountAbi_v1.js";
import { LightAccountAbi_v2 } from "../abis/LightAccountAbi_v2.js";
import { LightAccountFactoryAbi_v1 } from "../abis/LightAccountFactoryAbi_v1.js";
import { LightAccountFactoryAbi_v2 } from "../abis/LightAccountFactoryAbi_v2.js";
import { predictLightAccountAddress } from "../predictAddress.js";
import type { LightAccountVersion } from "../types.js";
import {
  LightAccountUnsupported1271Factories,
  defaultLightAccountVersion,
  getDefaultLightAccountFactoryAddress,
  lowerAddress,
} from "../utils.js";
import { createLightAccountBase, type LightAccountBase } from "./base.js";
import { BaseError } from "@alchemy/common";

export type LightAccount<
  TLightAccountVersion extends
    LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
> = LightAccountBase<"LightAccount", TLightAccountVersion> & {
  encodeTransferOwnership: (newOwner: Address) => Hex;
  getOwnerAddress: () => Promise<Address>;
};

export type CreateLightAccountParams<
  TLightAccountVersion extends
    LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
> = {
  client: Client<Transport, Chain, JsonRpcAccount | LocalAccount>;
  salt?: bigint;
  accountAddress?: Address;
  factoryAddress?: Address;
  version?: TLightAccountVersion;
};

/**
 * Creates a light account.
 *
 * @param {CreateLightAccountParams} param0 - The parameters for creating a light account.
 * @returns {Promise<LightAccount<TSigner, TLightAccountVersion>>} A light account.
 */
export async function createLightAccount<
  TLightAccountVersion extends
    LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
>({
  client,
  salt: salt_ = 0n,
  accountAddress: accountAddress_,
  version = defaultLightAccountVersion() as TLightAccountVersion,
  factoryAddress = getDefaultLightAccountFactoryAddress(client.chain, version),
}: CreateLightAccountParams<TLightAccountVersion>): Promise<
  LightAccount<TLightAccountVersion>
> {
  const accountAbi =
    version === "v2.0.0" ? LightAccountAbi_v2 : LightAccountAbi_v1;
  const factoryAbi =
    version === "v2.0.0"
      ? LightAccountFactoryAbi_v2
      : LightAccountFactoryAbi_v1;

  const signerAddress = client.account.address;

  const salt = LightAccountUnsupported1271Factories.has(
    lowerAddress(factoryAddress),
  )
    ? 0n
    : salt_;

  const accountAddress =
    accountAddress_ ??
    predictLightAccountAddress({
      factoryAddress,
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
      factory: factoryAddress,
      factoryData,
    };
  };

  const baseAccount = await createLightAccountBase({
    client,
    abi: accountAbi,
    accountAddress,
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
      const owner = await readContract(client, {
        address: accountAddress,
        abi: accountAbi,
        functionName: "owner",
      });

      if (owner == null) {
        throw new BaseError("could not get on-chain owner");
      }

      return owner;
    },
  };
}
