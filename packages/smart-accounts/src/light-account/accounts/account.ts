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
} from "../utils.js";
import { toLightAccountBase, type LightAccountBase } from "./base.js";
import { BaseError, lowerAddress } from "@alchemy/common";
import { getAction } from "viem/utils";

export type LightAccount<
  TLightAccountVersion extends
    LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
> = LightAccountBase<"LightAccount", TLightAccountVersion> & {
  encodeTransferOwnership: (newOwner: Address) => Hex;
  getOwnerAddress: () => Promise<Address>;
};

export type ToLightAccountParams<
  TLightAccountVersion extends
    LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
> = {
  client: Client<Transport, Chain, JsonRpcAccount | LocalAccount | undefined>;
  owner: JsonRpcAccount | LocalAccount;
  salt?: bigint;
  accountAddress?: Address;
  factoryAddress?: Address;
  version?: TLightAccountVersion;
};

/**
 * Creates a light account.
 *
 * @param {ToLightAccountParams} param0 - The parameters for creating a light account.
 * @returns {Promise<LightAccount<TSigner, TLightAccountVersion>>} A light account.
 */
export async function toLightAccount<
  TLightAccountVersion extends
    LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
>({
  client,
  owner,
  salt: salt_ = 0n,
  accountAddress: accountAddress_,
  version = defaultLightAccountVersion() as TLightAccountVersion,
  factoryAddress = getDefaultLightAccountFactoryAddress(client.chain, version),
}: ToLightAccountParams<TLightAccountVersion>): Promise<
  LightAccount<TLightAccountVersion>
> {
  const accountAbi =
    version === "v2.0.0" ? LightAccountAbi_v2 : LightAccountAbi_v1;
  const factoryAbi =
    version === "v2.0.0"
      ? LightAccountFactoryAbi_v2
      : LightAccountFactoryAbi_v1;

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
      ownerAddress: owner.address,
      version,
    });

  const getFactoryArgs = async () => {
    const factoryData = encodeFunctionData({
      abi: factoryAbi,
      functionName: "createAccount",
      args: [owner.address, salt],
    });

    return {
      factory: factoryAddress,
      factoryData,
    };
  };

  const baseAccount = await toLightAccountBase({
    client,
    owner,
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
      const readContractAction = getAction(
        client,
        readContract,
        "readContract",
      );
      const owner = await readContractAction({
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
