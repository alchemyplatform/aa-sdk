import type { SmartAccountSigner } from "@aa-sdk/core";
import {
  encodeFunctionData,
  type Address,
  type Chain,
  type Hex,
  type PublicClient,
  type Transport,
} from "viem";
import { readContract } from "viem/actions";
import { MultiOwnerLightAccountAbi } from "./abis/MultiOwnerLightAccountAbi.js";
import { MultiOwnerLightAccountFactoryAbi } from "./abis/MultiOwnerLightAccountFactoryAbi.js";
import {
  createLightAccountBase,
  type LightAccountBase,
} from "./base-account.js";
import { predictMultiOwnerLightAccountAddress } from "./predictAddress.js";
import { getDefaultMultiOwnerLightAccountFactoryAddress } from "./utils.js";

export type MultiOwnerLightAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = LightAccountBase<TSigner, "MultiOwnerLightAccount", "v2.0.0"> & {
  encodeAddOwner: (ownerToAdd: Address) => Hex;
  encodeRemoveOwner: (ownerToRemove: Address) => Hex;
  getOwnerAddresses: () => Promise<readonly Address[]>;
};

export type CreateMultiOwnerLightAccountParams<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = {
  client: PublicClient<TTransport, Chain>;
  signer: TSigner;
  owners: Address[];
  salt?: bigint;
  accountAddress?: Address;
  factoryAddress?: Address;
};

export async function createMultiOwnerLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
>({
  client,
  signer,
  owners,
  salt = 0n,
  accountAddress,
  factoryAddress,
}: CreateMultiOwnerLightAccountParams<TTransport, TSigner>): Promise<
  MultiOwnerLightAccount<TSigner>
> {
  const signerAddress = await signer.getAddress();

  // Deduplicate and sort owners
  const deduplicatedOwners = Array.from(
    new Set([signerAddress, ...owners].map((owner) => owner.toLowerCase()))
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
    signer,
    accountAddress: address,
    type: "MultiOwnerLightAccount",
    version: "v2.0.0",
    getFactoryArgs,
  });

  return {
    ...baseAccount,

    encodeAddOwner: (ownerToAdd: Address) => {
      return encodeFunctionData({
        abi: MultiOwnerLightAccountAbi,
        functionName: "updateOwners",
        args: [[ownerToAdd], []],
      });
    },

    encodeRemoveOwner: (ownerToRemove: Address) => {
      return encodeFunctionData({
        abi: MultiOwnerLightAccountAbi,
        functionName: "updateOwners",
        args: [[], [ownerToRemove]],
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

      return callResult as readonly Address[];
    },
  };
}
