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
import { MultiOwnerLightAccountAbi } from "../abis/MultiOwnerLightAccountAbi.js";
import { MultiOwnerLightAccountFactoryAbi } from "../abis/MultiOwnerLightAccountFactoryAbi.js";
import { predictMultiOwnerLightAccountAddress } from "../predictAddress.js";
import { getDefaultMultiOwnerLightAccountFactoryAddress } from "../utils.js";
import {
  createLightAccountBase,
  type LightAccountBase,
} from "./base-account.js";

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
  client: Client<Transport, Chain, JsonRpcAccount | LocalAccount>;
  owners?: Address[];
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
  owners,
  salt = 0n,
  accountAddress,
  factoryAddress,
}: CreateMultiOwnerLightAccountParams): Promise<MultiOwnerLightAccount> {
  const signerAddress = client.account.address;

  // Deduplicate and sort owners
  const deduplicatedOwners = Array.from(
    new Set(
      [signerAddress, ...(owners ?? [])].map((owner) => owner.toLowerCase()),
    ),
  ) as Address[];

  const sortedOwners = deduplicatedOwners.sort((a, b) => {
    const bigintA = BigInt(a);
    const bigintB = BigInt(b);
    return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
  });

  const finalFactoryAddress =
    factoryAddress ??
    getDefaultMultiOwnerLightAccountFactoryAddress(client.chain, "v2.0.0");

  const address =
    accountAddress ??
    predictMultiOwnerLightAccountAddress({
      factoryAddress: finalFactoryAddress,
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
      factory: finalFactoryAddress,
      factoryData,
    };
  };

  const baseAccount = await createLightAccountBase({
    client,
    abi: MultiOwnerLightAccountAbi,
    accountAddress: address,
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
      const callResult = await readContract(client, {
        address,
        abi: MultiOwnerLightAccountAbi,
        functionName: "owners",
      });

      if (callResult == null) {
        throw new Error("could not get on-chain owners");
      }

      if (!callResult.includes(client.account.address)) {
        throw new Error("on-chain owners does not include the current signer");
      }

      return callResult as readonly Address[];
    },
  };
}
