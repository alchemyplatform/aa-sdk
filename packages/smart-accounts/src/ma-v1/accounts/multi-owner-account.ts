import {
  encodeFunctionData,
  hexToBigInt,
  type Address,
  type Chain,
  type Client,
  type Hash,
  type Hex,
  type JsonRpcAccount,
  type LocalAccount,
  type OneOf,
  type Transport,
  type TypedDataDefinition,
} from "viem";
import { toModularAccountV1Base, type ModularAccountV1Base } from "./base.js";
import { lowerAddress, BaseError } from "@alchemy/common";
import { DefaultMaV1Address, DefaultMaV1PluginAddress } from "../account.js";
import { MultiOwnerModularAccountFactoryAbi } from "../abis/MultiOwnerModularAccountFactory.js";
import {
  getMultiOwnerModularAccountV1AddressFromFactoryData,
  predictMultiOwnerModularAccountV1Address,
} from "../predictAddress.js";
import { MultiOwnerPluginExecutionFunctionAbi } from "../abis/MultiOwnerPluginExecutionFunction.js";
import { readContract } from "viem/actions";
import { getAction } from "viem/utils";
import { MultiOwnerPluginAbi } from "../abis/MultiOwnerPlugin.js";
import { entryPoint06Address } from "viem/account-abstraction";

export type MultiOwnerModularAccountV1 = ModularAccountV1Base & {
  encodeUpdateOwners: (
    ownersToAdd: Address[],
    ownersToRemove: Address[],
  ) => Hex;
  getOwnerAddresses: () => Promise<readonly Address[]>;
};

export type ToMultiOwnerModularAccountV1Params = {
  client: Client<Transport, Chain, JsonRpcAccount | LocalAccount | undefined>;
  owners: [OneOf<JsonRpcAccount | LocalAccount>, ...{ address: Address }[]];
  accountAddress?: Address;
  factory?: Address;
} & (
  | { salt?: bigint; factoryData?: never }
  | { salt?: never; factoryData?: Hex }
);

/**
 * Creates a multi-owner MAv1 account.
 *
 * @param {ToMultiOwnerModularAccountV1Params} param0 - The parameters for creating a multi-owner MAv1 account.
 * @returns {Promise<MultiOwnerModularAccountV1<TSigner>>} A multi-owner MAv1 account.
 */
export async function toMultiOwnerModularAccountV1({
  client,
  salt = 0n,
  owners,
  accountAddress: accountAddress_,
  factory = DefaultMaV1Address.MULTI_OWNER_MAV1_FACTORY,
  factoryData: factoryData_,
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
    (factoryData_
      ? await getMultiOwnerModularAccountV1AddressFromFactoryData({
          client,
          factoryAddress: factory,
          factoryData: factoryData_,
          entryPoint: {
            version: "0.6",
            address: entryPoint06Address,
          },
        })
      : predictMultiOwnerModularAccountV1Address({
          factoryAddress: factory,
          salt,
          ownerAddresses: sortedOwners,
        }));

  const getFactoryArgs = async () => {
    const factoryData =
      factoryData_ ??
      encodeFunctionData({
        abi: MultiOwnerModularAccountFactoryAbi,
        functionName: "createAccount",
        args: [salt, sortedOwners],
      });

    return {
      factory,
      factoryData,
    };
  };

  const get712Wrapper = async (msg: Hash): Promise<TypedDataDefinition> => {
    const readContractAction = getAction(client, readContract, "readContract");

    const [, name, version, chainId, verifyingContract, salt] =
      await readContractAction({
        abi: MultiOwnerPluginAbi,
        address: DefaultMaV1PluginAddress.MULTI_OWNER,
        functionName: "eip712Domain",
        account: accountAddress,
      });

    return {
      domain: {
        chainId: Number(chainId),
        name,
        salt,
        verifyingContract,
        version,
      },
      types: {
        AlchemyModularAccountMessage: [{ name: "message", type: "bytes" }],
      },
      message: {
        message: msg,
      },
      primaryType: "AlchemyModularAccountMessage",
    };
  };

  const baseAccount = await toModularAccountV1Base({
    client,
    owner: signer,
    accountAddress,
    getFactoryArgs,
    type: "MultiOwnerModularAccountV1",
    get712Wrapper,
  });

  return {
    ...baseAccount,

    encodeUpdateOwners: (ownersToAdd: Address[], ownersToRemove: Address[]) => {
      return encodeFunctionData({
        abi: MultiOwnerPluginExecutionFunctionAbi,
        functionName: "updateOwners",
        args: [ownersToAdd, ownersToRemove],
      });
    },

    async getOwnerAddresses(): Promise<readonly Address[]> {
      const readContractAction = getAction(
        client,
        readContract,
        "readContract",
      );
      const ownersOnChain = await readContractAction({
        address: DefaultMaV1PluginAddress.MULTI_OWNER,
        abi: MultiOwnerPluginAbi,
        functionName: "ownersOf",
        args: [accountAddress],
      });

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
