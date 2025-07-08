import type { SmartAccountSigner, SmartContractAccount } from "@aa-sdk/core";
import {
  createModularAccountV2,
  createLightAccount,
  createMultiOwnerLightAccount,
  createMultiOwnerModularAccount,
} from "@account-kit/smart-contracts";
import {
  concatHex,
  type Chain,
  type Transport,
  type Address,
  hexToNumber,
} from "viem";
import type { StaticDecode } from "@sinclair/typebox";
import { SerializedInitcode } from "@alchemy/wallet-api-types";
import {
  Eip7702AccountTypeToDelegationAddress,
  PermissionsCapability,
  decodePermissionsContext,
  type Supported7702AccountType,
} from "@alchemy/wallet-api-types/capabilities";
import { InternalError, InvalidRequestError } from "ox/RpcResponse";
import { assertNever } from "../utils.js";

type CreateAccountParams = {
  chain: Chain;
  transport: Transport;
  signer: SmartAccountSigner;
  accountAddress: Address;
  counterfactualInfo?: StaticDecode<typeof SerializedInitcode>; // undefined for 7702 accounts
  permissions?: StaticDecode<typeof PermissionsCapability>;
  delegation?: Address;
};

/**
 * Creates a smart account instance from the given parameters.
 * @param params - The parameters for creating a smart account.
 * @returns A promise that resolves to the created smart account.
 */
export async function createAccount(
  params: CreateAccountParams,
): Promise<SmartContractAccount> {
  const { counterfactualInfo: ci, ...accountParams } = params;

  // This throws if we pass a permission context and the account is not MA-v2
  // TODO: test that this edge case is handled correctly
  const parsedContext = parsePermissionsContext(
    params.permissions,
    ci,
    params.delegation,
  );

  const signerEntity =
    parsedContext?.contextVersion === "NON_DEFERRED_ACTION"
      ? {
          entityId: hexToNumber(parsedContext.entityId),
          isGlobalValidation: parsedContext.isGlobalValidation,
        }
      : undefined;

  const mode = params.delegation ? "7702" : "default";

  if (mode === "7702") {
    const accountType = getAccountTypeForDelegationAddress7702(
      params.delegation!,
    );
    if (accountType !== "ModularAccountV2") {
      throw new Error("7702 mode currently only supports ModularAccountV2");
    }
    return createModularAccountV2({
      ...accountParams,
      signerEntity,
      deferredAction: parsedContext?.deferredAction,
      mode,
    });
  }

  if (mode !== "default") {
    return assertNever(mode, "Unexpected mode in createAccount");
  }

  // At this point, we are guaranteed to be in default mode, where ci
  // (counterfactualInfo) must be defined

  if (!ci) {
    throw new InternalError({
      message: "Counterfactual info not found",
    });
  }

  const factoryType = ci.factoryType;
  const commonParams = {
    ...accountParams,
    initCode: concatHex([ci.factoryAddress, ci.factoryData]),
  };

  // Return the account created based on the factory type
  switch (factoryType) {
    case "MAv2.0.0-sma-b":
      return createModularAccountV2({
        ...commonParams,
        signerEntity,
        deferredAction: parsedContext?.deferredAction,
        mode,
      });
    case "LightAccountV2.0.0":
      return createLightAccount({
        ...commonParams,
        version: "v2.0.0",
      });
    case "LightAccountV1.0.1":
      return createLightAccount({
        ...commonParams,
        version: "v1.0.1",
      });
    case "LightAccountV1.0.2":
      return createLightAccount({
        ...commonParams,
        version: "v1.0.2",
      });
    case "LightAccountV1.1.0":
      return createLightAccount({
        ...commonParams,
        version: "v1.1.0",
      });
    case "MAv1.0.0-MultiOwner":
      return createMultiOwnerModularAccount({
        ...commonParams,
      });
    case "LightAccountV2.0.0-MultiOwner":
      return createMultiOwnerLightAccount({
        ...commonParams,
        version: "v2.0.0",
      });
    case "MAv1.0.0-MultiSig":
    case "MAv2.0.0-ma-ssv":
    case "MAv2.0.0-ma-webauthn":
    case "unknown":
    case undefined:
      throw new InvalidRequestError({
        message: `Account type currently unsupported: ${factoryType}`,
      });
    default:
      return assertNever(factoryType, "Unsupported factory type");
  }
}

function parsePermissionsContext(
  permissions?: StaticDecode<typeof PermissionsCapability>,
  parsedCi?: StaticDecode<typeof SerializedInitcode> | undefined,
  delegation7702?: Address,
) {
  if (!permissions) {
    return undefined;
  }

  if ("sessionId" in permissions) {
    throw new InvalidRequestError({
      message: "Remote permissions are not supported in isomorphic client",
    });
  }

  if (!("context" in permissions)) {
    return undefined;
  }

  const isMAV2 =
    (parsedCi && parsedCi.factoryType === "MAv2.0.0-sma-b") ||
    (delegation7702 &&
      getAccountTypeForDelegationAddress7702(delegation7702) ===
        "ModularAccountV2");

  if (!isMAV2) {
    throw new InvalidRequestError({
      message: "Permissions are currently only supported by MAv2 accounts",
    });
  }

  const context = decodePermissionsContext(permissions);

  if (context?.contextVersion === "REMOTE_MODE_DEFERRED_ACTION") {
    throw new InvalidRequestError({
      message: "Remote mode deferred action not supported in isomorphic client",
    });
  }

  return context;
}

const DelegationAddressToAccountType: Record<
  Address,
  Supported7702AccountType
> = Object.fromEntries(
  Object.entries(Eip7702AccountTypeToDelegationAddress).map(([key, value]) => [
    value,
    key,
  ]),
) as Record<Address, Supported7702AccountType>;

const getAccountTypeForDelegationAddress7702 = (
  address: Address,
): Supported7702AccountType | undefined => {
  return DelegationAddressToAccountType[address];
};
