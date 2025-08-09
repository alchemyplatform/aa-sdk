import type { SmartAccountSigner, SmartContractAccount } from "@aa-sdk/core";
import {
  createModularAccountV2,
  createLightAccount,
  createMultiOwnerLightAccount,
  createMultiOwnerModularAccount,
} from "@account-kit/smart-contracts";
import { concatHex, type Chain, type Transport, type Address } from "viem";
import type { StaticDecode } from "@sinclair/typebox";
import { SerializedInitcode } from "@alchemy/wallet-api-types";
import { InternalError, InvalidRequestError } from "ox/RpcResponse";
import { assertNever } from "../utils.js";
import { getAccountTypeForDelegationAddress7702 } from "@alchemy/wallet-api-types/capabilities";
import { metrics } from "../metrics.js";

type CreateAccountParams = {
  chain: Chain;
  transport: Transport;
  signer: SmartAccountSigner;
  accountAddress: Address;
  counterfactualInfo?: StaticDecode<typeof SerializedInitcode>; // undefined for 7702 accounts
  delegation?: Address; // for 7702 accounts
};

/**
 * Creates a smart account instance from the given parameters.
 *
 * @param {CreateAccountParams} params - The parameters for creating a smart account.
 * @returns {Promise<SmartContractAccount>} A promise that resolves to the created smart account.
 *
 * @example
 * ```ts
 * // Create a smart account
 * const account = await createAccount({
 *   chain: arbitrumSepolia,
 *   transport: alchemy({
 *     apiKey: "your-alchemy-api-key",
 *   }),
 *   signer: signer,
 *   accountAddress: "0x1234...",
 * });
 * ```
 */
export async function createAccount(
  params: CreateAccountParams,
): Promise<SmartContractAccount> {
  const { counterfactualInfo: ci, ...accountParams } = params;

  if (params.delegation) {
    const accountType = getAccountTypeForDelegationAddress7702(
      params.delegation,
    );
    if (accountType !== "ModularAccountV2") {
      throw new Error("7702 mode currently only supports ModularAccountV2");
    }
    return createModularAccountV2({
      ...accountParams,
      mode: "7702",
    });
  }

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

  metrics.trackEvent({
    name: "account_initialized",
    data: {
      chainId: params.chain.id,
      factory: params.delegation
        ? "7702"
        : (params.counterfactualInfo?.factoryType ?? "unknown"),
    },
  });

  // Return the account created based on the factory type
  switch (factoryType) {
    case "MAv2.0.0-sma-b":
      return createModularAccountV2({
        ...commonParams,
        mode: "default",
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
