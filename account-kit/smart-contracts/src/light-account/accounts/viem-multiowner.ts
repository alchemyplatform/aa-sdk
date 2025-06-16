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
import { MultiOwnerLightAccountAbi } from "../abis/MultiOwnerLightAccountAbi.js";
import { MultiOwnerLightAccountFactoryAbi } from "../abis/MultiOwnerLightAccountFactoryAbi.js";
import { getDefaultMultiOwnerLightAccountFactoryAddress } from "../utils.js";
import { predictMultiOwnerLightAccountAddress } from "./predictAddress.js";
import {
  createViemLightAccountBase,
  type ViemLightAccountBase,
} from "./viem-base.js";

export type ViemMultiOwnerLightAccount<
  TSigner extends SmartAccountSigner = SmartAccountSigner,
> = ViemLightAccountBase<TSigner, "MultiOwnerLightAccount", "v2.0.0"> & {
  encodeAddOwner: (ownerToAdd: Address) => Hex;
  encodeRemoveOwner: (ownerToRemove: Address) => Hex;
  getOwnerAddresses: () => Promise<readonly Address[]>;
};

export type CreateViemMultiOwnerLightAccountParams<
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

export async function createViemMultiOwnerLightAccount<
  TTransport extends Transport = Transport,
  TSigner extends SmartAccountSigner = SmartAccountSigner,
>({
  client,
  signer,
  owners,
  salt = 0n,
  accountAddress,
  factoryAddress,
}: CreateViemMultiOwnerLightAccountParams<TTransport, TSigner>): Promise<
  ViemMultiOwnerLightAccount<TSigner>
> {
  const signerAddress = await signer.getAddress();

  // Deduplicate and sort owners
  const deduplicatedOwners = Array.from(
    new Set([signerAddress, ...owners].map((owner) => owner.toLowerCase())),
  ).map((owner) => owner as Address);

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

  const baseAccount = await createViemLightAccountBase({
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
