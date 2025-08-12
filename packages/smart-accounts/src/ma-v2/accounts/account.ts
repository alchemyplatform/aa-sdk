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
import type {
  WebAuthnAccount,
  ToSmartAccountParameters,
} from "viem/account-abstraction";
import { toModularAccountV2Base, type ModularAccountV2Base } from "./base.js";
import type { SignerEntity } from "../types.js";
import { predictModularAccountV2Address } from "../predictAddress.js";
import { parsePublicKey } from "webauthn-p256";
import { accountFactoryAbi } from "../abis/accountFactoryAbi.js";
import { EntityIdOverrideError } from "../../errors/EntityIdOverrideError.js";
import { InvalidOwnerError } from "../../errors/InvalidOwnerError.js";
import { DEFAULT_OWNER_ENTITY_ID, DefaultAddress } from "../utils/account.js";

type Mode = "default" | "7702";

// TODO(v5): does this need to be extended w/ any more methods like LightAccount does?
export type ModularAccountV2 = ModularAccountV2Base & {};

export type ToModularAccountV2Params<
  TMode extends Mode | undefined = Mode | undefined,
> = {
  client: Client<Transport, Chain, JsonRpcAccount | LocalAccount | undefined>;
  owner: JsonRpcAccount | LocalAccount | WebAuthnAccount;
  deferredAction?: Hex;
  signerEntity?: SignerEntity;
  accountAddress?: Address;
  mode?: TMode;
} & (TMode extends "7702"
  ? {
      salt?: never;
      factoryAddress?: never;
      factoryData?: never;
      implementationAddress?: never;
    }
  : {
      salt?: bigint;
      factoryAddress?: Address;
      factoryData?: Hex;
      implementationAddress?: Address;
    });

/**
 * Creates a MAv2 account.
 *
 * @param {ToModularAccountV2Params} param0 - The parameters for creating a MAv2 account.
 * @returns {Promise<ModularAccountV2>} A MAv2 account.
 */
export async function toModularAccountV2<TMode extends Mode = Mode>({
  client,
  owner,
  deferredAction,
  signerEntity,
  accountAddress: accountAddress_,
  salt = 0n,
  factoryAddress: factoryAddress_,
  factoryData: factoryData_,
  implementationAddress: implementationAddress_,
  mode,
}: ToModularAccountV2Params<TMode>): Promise<ModularAccountV2> {
  const is7702 = mode === "7702";

  const entityId = signerEntity?.entityId ?? DEFAULT_OWNER_ENTITY_ID;

  const factoryAddress =
    factoryAddress_ ??
    (owner.type === "webAuthn"
      ? DefaultAddress.MAV2_FACTORY_WEBAUTHN
      : DefaultAddress.MAV2_FACTORY);

  const implementationAddress =
    implementationAddress_ ??
    (is7702
      ? DefaultAddress.SMAV2_7702
      : owner.type === "webAuthn"
        ? DefaultAddress.MAV2
        : DefaultAddress.SMAV2_BYTECODE);

  const getFactoryArgs = async () => {
    if (is7702) {
      // This is only for EP 0.8.0.
      // return {
      //   factory: "0x7702",
      //   factoryData: "0x",
      // } as const;
      return {
        factory: undefined,
        factoryData: undefined,
      } as const;
    }

    if (owner.type === "webAuthn") {
      const { x, y } = parsePublicKey(owner.publicKey);
      return {
        factory: factoryAddress,
        factoryData:
          factoryData_ ??
          encodeFunctionData({
            abi: accountFactoryAbi,
            functionName: "createWebAuthnAccount",
            args: [x, y, salt, entityId],
          }),
      };
    }

    return {
      factory: factoryAddress,
      factoryData:
        factoryData_ ??
        encodeFunctionData({
          abi: accountFactoryAbi,
          functionName: "createSemiModularAccount",
          args: [owner.address, salt],
        }),
    };
  };

  const accountAddress =
    accountAddress_ ??
    (mode === "7702" && owner.type === "local"
      ? owner.address
      : predictModularAccountV2Address({
          factoryAddress,
          implementationAddress,
          salt,
          ...(owner.type === "webAuthn"
            ? {
                type: "WebAuthn",
                ownerPublicKey: owner.publicKey,
                entityId,
              }
            : {
                type: "SMA", // `MA` is never used here since we only support deploying SMA & WebAuthn accounts.
                ownerAddress: owner.address,
                entityId,
              }),
        }));

  let authorization: ToSmartAccountParameters["authorization"];
  if (is7702) {
    // TODO(v5): Ensure this works w/ our signer types.
    if (owner.type !== "local") {
      throw new InvalidOwnerError(
        `Owner of type ${owner.type} is unsupported for 7702 mode.`,
      );
    }
    if (owner.signAuthorization == null) {
      throw new InvalidOwnerError(
        "Owner must implement `signAuthorization` to be used with 7702 mode.",
      );
    }
    if (
      entityId === DEFAULT_OWNER_ENTITY_ID &&
      owner.address !== accountAddress
    ) {
      throw new EntityIdOverrideError();
    }
    authorization = {
      // The current version of Viem has some pretty strict constraints
      // on a `PrivateKeyAccount`, but this seems safe as long as the
      // owner is able to `signAuthorization`.
      account: owner as PrivateKeyAccount,
      address: DefaultAddress.SMAV2_7702,
    };
  }

  const base = await toModularAccountV2Base({
    client,
    owner,
    accountAddress,
    getFactoryArgs,
    signerEntity,
    deferredAction,
    authorization,
  });

  return {
    ...base,
    // TODO(v5): does this need to be extended w/ any more methods like LightAccount does?
  };
}
