import {
  encodeFunctionData,
  hexToBigInt,
  type Address,
  type Chain,
  type Client,
  type Hex,
  type JsonRpcAccount,
  type LocalAccount,
  type OneOf,
  type Transport,
} from "viem";
import { readContract } from "viem/actions";
import { MultiOwnerLightAccountAbi } from "../abis/MultiOwnerLightAccountAbi.js";
import { MultiOwnerLightAccountFactoryAbi } from "../abis/MultiOwnerLightAccountFactoryAbi.js";
import { predictMultiOwnerLightAccountAddress } from "../predictAddress.js";
import {
  getDefaultMultiOwnerLightAccountFactoryAddress,
  lowerAddress,
} from "../utils.js";
import { createLightAccountBase, type LightAccountBase } from "./base.js";
import { BaseError } from "@alchemy/common";

export type MultiOwnerLightAccount = LightAccountBase<
  "MultiOwnerLightAccount",
  "v2.0.0"
> & {
  encodeUpdateOwners: (
    ownersToAdd: Address[],
    ownersToRemove: Address[],
  ) => Hex;
  getOwnerAddresses: () => Promise<readonly Address[]>;
};

export type CreateMultiOwnerLightAccountParams = {
  client: Client<Transport, Chain, JsonRpcAccount | LocalAccount | undefined>;
  owners: OneOf<JsonRpcAccount | LocalAccount>[];
  salt?: bigint;
  accountAddress?: Address;
  factoryAddress?: Address;
};

/**
 * Creates a multi-owner light account.
 *
 * @param {CreateMultiOwnerLightAccountParams} param0 - The parameters for creating a multi-owner light account.
 * @returns {Promise<MultiOwnerLightAccount<TSigner>>} A multi-owner light account.
 */
export async function createMultiOwnerLightAccount({
  client,
  salt = 0n,
  owners = [],
  accountAddress: accountAddress_,
  factoryAddress = getDefaultMultiOwnerLightAccountFactoryAddress(
    client.chain,
    "v2.0.0",
  ),
}: CreateMultiOwnerLightAccountParams): Promise<MultiOwnerLightAccount> {
  const signer = owners[0];

  const dedupedOwners = Array.from(
    new Set(owners.map((it) => lowerAddress(it.address))),
  );

  const sortedOwners = dedupedOwners.sort((a, b) => {
    const bigintA = hexToBigInt(a);
    const bigintB = hexToBigInt(b);
    return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
  });

  const accountAddress =
    accountAddress_ ??
    predictMultiOwnerLightAccountAddress({
      factoryAddress,
      salt,
      ownerAddresses: sortedOwners,
    });

  const getFactoryArgs = async () => {
    const factoryData = encodeFunctionData({
      abi: MultiOwnerLightAccountFactoryAbi,
      functionName: "createAccount",
      args: [sortedOwners, salt],
    });

    return {
      factory: factoryAddress,
      factoryData,
    };
  };

  const baseAccount = await createLightAccountBase({
    client,
    owner: signer,
    abi: MultiOwnerLightAccountAbi,
    accountAddress,
    type: "MultiOwnerLightAccount",
    version: "v2.0.0",
    getFactoryArgs,
  });

  return {
    ...baseAccount,

    encodeUpdateOwners: (ownersToAdd: Address[], ownersToRemove: Address[]) => {
      return encodeFunctionData({
        abi: MultiOwnerLightAccountAbi,
        functionName: "updateOwners",
        args: [ownersToAdd, ownersToRemove],
      });
    },

    async getOwnerAddresses(): Promise<readonly Address[]> {
      const ownersOnChain = await readContract(client, {
        address: accountAddress,
        abi: MultiOwnerLightAccountAbi,
        functionName: "owners",
      });

      if (ownersOnChain == null) {
        throw new BaseError("could not get on-chain owners");
      }

      if (
        !ownersOnChain
          .map((it) => lowerAddress(it))
          .includes(lowerAddress(signer.address))
      ) {
        throw new BaseError(
          "on-chain owners does not include the current signer",
        );
      }

      return ownersOnChain;
    },
  };
}
