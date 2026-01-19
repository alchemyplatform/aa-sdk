import {
  encodeFunctionData,
  type Address,
  type Chain,
  type Client,
  type Hex,
  type JsonRpcAccount,
  type LocalAccount,
  type PrivateKeyAccount,
  type Transport,
} from "viem";
import { readContract } from "viem/actions";
import type { ToSmartAccountParameters } from "viem/account-abstraction";
import { LightAccountAbi_v1 } from "../abis/LightAccountAbi_v1.js";
import { LightAccountAbi_v2 } from "../abis/LightAccountAbi_v2.js";
import { LightAccountFactoryAbi_v1 } from "../abis/LightAccountFactoryAbi_v1.js";
import { LightAccountFactoryAbi_v2 } from "../abis/LightAccountFactoryAbi_v2.js";
import { predictLightAccountAddress } from "../predictAddress.js";
import {
  type LightAccountVersion,
  AccountVersionRegistry,
  isLightAccountVersion2,
} from "../registry.js";
import {
  LightAccountUnsupported1271Factories,
  defaultLightAccountVersion,
} from "../utils.js";
import { toLightAccountBase, type LightAccountBase } from "./base.js";
import { BaseError, lowerAddress } from "@alchemy/common";
import { getAction } from "viem/utils";
import { LOGGER } from "../../logger.js";
import { InvalidOwnerError } from "../../errors/InvalidOwnerError.js";
import { lightAccountStaticImpl7702V2_1_0 } from "../lightAccountStaticImpl.js";

type LightAccountMode = "default" | "7702";

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
  TMode extends LightAccountMode | undefined = LightAccountMode | undefined,
> = {
  client: Client<Transport, Chain, JsonRpcAccount | LocalAccount | undefined>;
  owner: JsonRpcAccount | LocalAccount;
  accountAddress?: Address;
  version?: TLightAccountVersion;
  mode?: TMode;
} & (TMode extends "7702"
  ? {
      salt?: never;
      factory?: never;
      factoryData?: never;
    }
  : {
      salt?: bigint;
      factory?: Address;
      factoryData?: Hex;
    });

/**
 * Creates a light account.
 *
 * @param {ToLightAccountParams} param0 - The parameters for creating a light account.
 * @returns {Promise<LightAccount<TSigner, TLightAccountVersion>>} A light account.
 */
export async function toLightAccount<
  TLightAccountVersion extends
    LightAccountVersion<"LightAccount"> = LightAccountVersion<"LightAccount">,
  TMode extends LightAccountMode = LightAccountMode,
>({
  client,
  owner,
  salt: salt_ = 0n,
  accountAddress: accountAddress_,
  version = defaultLightAccountVersion() as TLightAccountVersion,
  factory = AccountVersionRegistry.LightAccount[version].factoryAddress,
  factoryData: factoryData_,
  mode,
}: ToLightAccountParams<TLightAccountVersion, TMode>): Promise<
  LightAccount<TLightAccountVersion>
> {
  const is7702 = mode === "7702";

  LOGGER.debug("toLightAccount:start", {
    version,
    mode,
    hasAccountAddress: !!accountAddress_,
  });

  const accountAbi = isLightAccountVersion2(version)
    ? LightAccountAbi_v2
    : LightAccountAbi_v1;
  const factoryAbi = isLightAccountVersion2(version)
    ? LightAccountFactoryAbi_v2
    : LightAccountFactoryAbi_v1;

  const salt = LightAccountUnsupported1271Factories.has(lowerAddress(factory))
    ? 0n
    : salt_;

  const accountAddress =
    accountAddress_ ??
    (is7702 && owner.type === "local"
      ? owner.address
      : predictLightAccountAddress({
          factoryAddress: factory,
          salt,
          ownerAddress: owner.address,
          version,
        }));

  LOGGER.debug("toLightAccount:address-resolved", { accountAddress, is7702 });

  const getFactoryArgs = async () => {
    if (is7702) {
      // EIP-7702 uses special factory address for EP 0.8
      return {
        factory: "0x7702000000000000000000000000000000000000" as Address,
        factoryData: "0x" as Hex,
      } as const;
    }

    const factoryData =
      factoryData_ ??
      encodeFunctionData({
        abi: factoryAbi,
        functionName: "createAccount",
        args: [owner.address, salt],
      });

    return {
      factory,
      factoryData,
    };
  };

  let authorization: ToSmartAccountParameters["authorization"];
  if (is7702) {
    LOGGER.debug("toLightAccount:7702-mode");
    if (owner.type !== "local") {
      LOGGER.error("toLightAccount:invalid-owner-type", {
        ownerType: owner.type,
      });
      throw new InvalidOwnerError(
        `Owner of type ${owner.type} is unsupported for 7702 mode.`,
      );
    }
    if (owner.signAuthorization == null) {
      LOGGER.error("toLightAccount:missing-signAuthorization");
      throw new InvalidOwnerError(
        "Owner must implement `signAuthorization` to be used with 7702 mode.",
      );
    }
    authorization = {
      account: owner as PrivateKeyAccount,
      address: lightAccountStaticImpl7702V2_1_0.delegationAddress,
    };
  }

  const baseAccount = await toLightAccountBase({
    client,
    owner,
    abi: accountAbi,
    accountAddress,
    type: "LightAccount",
    version,
    getFactoryArgs,
    authorization,
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
      LOGGER.debug("getOwnerAddress:start", { accountAddress });
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
        LOGGER.error("getOwnerAddress:failed", { accountAddress });
        throw new BaseError("could not get on-chain owner");
      }

      LOGGER.debug("getOwnerAddress:success", { owner });
      return owner;
    },
  };
}
