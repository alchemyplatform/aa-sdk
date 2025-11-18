import {
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
import { MultiOwnerLightAccountAbi } from "../abis/MultiOwnerLightAccountAbi.js";
import { predictMultiOwnerLightAccountAddress } from "../predictAddress.js";
import { toModularAccountV1Base, type ModularAccountV1Base } from "./base.js";
import { lowerAddress } from "@alchemy/common";

export type MultiOwnerModularAccountV1 = ModularAccountV1Base & {
  // TODO(jh): does MAv1 use these?
  encodeUpdateOwners: (
    ownersToAdd: Address[],
    ownersToRemove: Address[],
  ) => Hex;
  getOwnerAddresses: () => Promise<readonly Address[]>;
};

export type ToMultiOwnerModularAccountV1Params = {
  client: Client<Transport, Chain, JsonRpcAccount | LocalAccount | undefined>;
  owners: OneOf<JsonRpcAccount | LocalAccount>[];
  salt?: bigint;
  accountAddress?: Address;
  factoryAddress?: Address;
  // TODO(jh): maybe we actually should have a subtype const here for MAv1 like LA?
};

/**
 * Creates a multi-owner MAv1 account.
 *
 * @param {ToMultiOwnerModularAccountV1Params} param0 - The parameters for creating a multi-owner MAv1 account.
 * @returns {Promise<MultiOwnerModularAccountV1<TSigner>>} A multi-owner MAv1 account.
 */
export async function toMultiOwnerModularAccountV1({
  client,
  salt = 0n,
  owners = [],
  accountAddress: accountAddress_,
  factoryAddress = "0xTODO", // TODO(jh): add MAv1 multi-owner factory address
}: ToMultiOwnerModularAccountV1Params): Promise<MultiOwnerModularAccountV1> {
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
    // TODO(jh): impl prediction func for MAv1
    predictMultiOwnerLightAccountAddress({
      factoryAddress,
      salt,
      ownerAddresses: sortedOwners,
    });

  const getFactoryArgs = async () => {
    throw new Error("Not implemented yet"); // TODO(jh): impl
  };

  const baseAccount = await toModularAccountV1Base({
    client,
    owner: signer,
    abi: MultiOwnerLightAccountAbi, // TODO(jh): change to MAv1 multi-owner ABI
    accountAddress,
    getFactoryArgs,
    // type: "MultiOwnerModularAccountV1", // TODO(jh): maybe we actually should have a subtype here for MAv1 like LA?
  });

  return {
    ...baseAccount,

    encodeUpdateOwners: (ownersToAdd: Address[], ownersToRemove: Address[]) => {
      throw new Error("Not implemented yet"); // TODO(jh): impl
    },

    async getOwnerAddresses(): Promise<readonly Address[]> {
      throw new Error("Not implemented yet"); // TODO(jh): impl
    },
  };
}
