import {
  type Address,
  type Hex,
  type Chain,
  type Client,
  type JsonRpcAccount,
  type LocalAccount,
  type Transport,
  concat,
  concatHex,
  encodeFunctionData,
  hashMessage,
  hashTypedData,
  type TypedDataDefinition,
  maxUint32,
  maxUint152,
  zeroAddress,
} from "viem";
import {
  entryPoint07Abi,
  type SmartAccountImplementation,
  entryPoint07Address,
  getUserOperationHash,
  toSmartAccount,
  type WebAuthnAccount,
  type ToSmartAccountParameters,
  estimateUserOperationGas,
  type UserOperation,
} from "viem/account-abstraction";
import {
  getCode,
  readContract,
  signMessage,
  signTypedData,
} from "viem/actions";
import { assertNever, BaseError } from "@alchemy/common";
import {
  SignaturePrefix,
  type ExecutionDataView,
  type SignerEntity,
  type ValidationDataView,
} from "../types.js";
import { modularAccountAbi } from "../abis/modularAccountAbi.js";
import type {
  SignatureRequest,
  SmartAccountWithDecodeCalls,
} from "../../types.js";
import {
  decodeFunctionData,
  getAction,
  isAddressEqual,
  sliceHex,
} from "viem/utils";
import {
  DEFAULT_OWNER_ENTITY_ID,
  DefaultModuleAddress,
  EXECUTE_USER_OP_SELECTOR,
  serializeModuleEntity,
} from "../utils/account.js";
import { parseDeferredAction } from "../utils/deferredActions.js";
import {
  pack1271Signature,
  toWebAuthnSignature,
  toReplaySafeTypedData,
  packUOSignature,
  WEBAUTHN_DUMMY_SIGNATURE,
} from "../utils/signature.js";
import { chainHas7212 } from "../../utils.js";
import { InvalidDeferredActionNonceError } from "../../errors/InvalidDeferredActionNonceError.js";
import { InvalidNonceKeyError } from "../../errors/InvalidNonceKeyError.js";
import { InvalidEntityIdError } from "../../errors/InvalidEntityIdError.js";
import { is7702Delegated } from "../../utils.js";

export type ValidationDataParams =
  | {
      validationModuleAddress: Address;
      entityId?: never;
    }
  | {
      validationModuleAddress?: never;
      entityId: number;
    };

export type BaseModularAccountV2Implementation = SmartAccountImplementation<
  typeof entryPoint07Abi,
  "0.7",
  {
    smartAccountType: "ModularAccountV2";
    signerEntity: SignerEntity;
    encodeCallData: (callData: Hex) => Promise<Hex>;
    getExecutionData: (selector: Hex) => Promise<ExecutionDataView>;
    getValidationData: (
      args: ValidationDataParams,
    ) => Promise<ValidationDataView>;
    prepareSignature: (request: SignatureRequest) => Promise<SignatureRequest>;
    formatSignature: (signature: Hex) => Promise<Hex>;
  },
  boolean
>;

export type ModularAccountV2Base =
  SmartAccountWithDecodeCalls<BaseModularAccountV2Implementation>;

export type ToModularAccountV2BaseParams<
  TTransport extends Transport = Transport,
> = {
  client: Client<TTransport, Chain, JsonRpcAccount | LocalAccount | undefined>;
  owner: JsonRpcAccount | LocalAccount | WebAuthnAccount;
  accountAddress: Address;
  getFactoryArgs: () => Promise<{
    factory?: Address | undefined;
    factoryData?: Hex | undefined;
  }>;
  signerEntity?: SignerEntity;
  deferredAction?: Hex;
  authorization?: ToSmartAccountParameters["authorization"];
};

/**
 * Creates a ModularAccountV2Base instance.
 *
 * @param {ToModularAccountV2BaseParams<TTransport>} params - The parameters for creating a ModularAccountV2Base instance.
 * @returns {Promise<ModularAccountV2Base>} A promise that resolves to a ModularAccountV2Base instance.
 */
export async function toModularAccountV2Base<
  TTransport extends Transport = Transport,
>({
  client,
  owner,
  accountAddress,
  getFactoryArgs,
  signerEntity = {
    isGlobalValidation: true,
    entityId: DEFAULT_OWNER_ENTITY_ID,
  },
  deferredAction,
  authorization,
}: ToModularAccountV2BaseParams<TTransport>): Promise<ModularAccountV2Base> {
  let { isGlobalValidation, entityId } = signerEntity;

  const entryPoint = {
    abi: entryPoint07Abi,
    address: entryPoint07Address as Address,
    version: "0.7" as const,
  };

  if (entityId > Number(maxUint32)) {
    throw new InvalidEntityIdError(entityId);
  }

  let isDeployed = false;

  const isAccountDeployed: () => Promise<boolean> = async () => {
    if (isDeployed) {
      return true;
    }
    const action = getAction(client, getCode, "getCode");
    const code = await action({ address: accountAddress });
    isDeployed = authorization
      ? is7702Delegated(authorization.address, code)
      : !!code;
    return isDeployed;
  };

  // These default values signal that we should not use the set deferred action nonce
  let nonce: bigint | undefined;
  let deferredActionData: Hex | undefined;
  let hasAssociatedExecHooks: boolean = false;

  if (deferredAction) {
    let deferredActionNonce = 0n;
    // We always update entity id and isGlobalValidation to the deferred action value since the client could be used to send multiple calls
    ({
      entityId,
      isGlobalValidation,
      nonce: deferredActionNonce,
    } = parseDeferredAction(deferredAction));

    const readContractAction = getAction(client, readContract, "readContract");

    // Set these values if the deferred action has not been consumed. We check this with the EP.
    const nextNonceForDeferredAction: bigint = await readContractAction({
      ...entryPoint,
      functionName: "getNonce",
      args: [accountAddress, deferredActionNonce >> 64n],
    });

    if (deferredActionNonce === nextNonceForDeferredAction) {
      ({ nonce, deferredActionData, hasAssociatedExecHooks } =
        parseDeferredAction(deferredAction));
    } else if (deferredActionNonce > nextNonceForDeferredAction) {
      // if nonce is greater than the next nonce, its invalid, so we throw
      throw new InvalidDeferredActionNonceError();
    }
  }

  const getNonce = async (
    params?: { key?: bigint | undefined } | undefined,
  ): Promise<bigint> => {
    if (nonce) {
      const tempNonce = nonce;
      nonce = undefined; // set to falsy value once used
      return tempNonce;
    }

    const nonceKey = params?.key ?? 0n;

    if (nonceKey > maxUint152) {
      throw new InvalidNonceKeyError(nonceKey);
    }

    const fullNonceKey =
      (nonceKey << 40n) +
      (BigInt(entityId) << 8n) +
      (isGlobalValidation ? 1n : 0n);

    const readContractAction = getAction(client, readContract, "readContract");

    return readContractAction({
      ...entryPoint,
      functionName: "getNonce",
      args: [accountAddress, fullNonceKey],
    });
  };

  const accountContract = {
    address: accountAddress,
    abi: modularAccountAbi,
  };

  const getExecutionData = async (selector: Hex) => {
    if (!(await isAccountDeployed())) {
      return {
        module: zeroAddress,
        skipRuntimeValidation: false,
        allowGlobalValidation: false,
        executionHooks: [],
      };
    }

    return readContract(client, {
      ...accountContract,
      functionName: "getExecutionData",
      args: [selector],
    });
  };

  // TODO(jh): this fails it the account is delegated to the wrong address!
  const getValidationData = async (args: ValidationDataParams) => {
    if (!(await isAccountDeployed())) {
      return {
        validationHooks: [],
        executionHooks: [],
        selectors: [],
        validationFlags: 0,
      };
    }

    const { validationModuleAddress, entityId } = args;
    const readContractAction = getAction(client, readContract, "readContract");
    return readContractAction({
      ...accountContract,
      functionName: "getValidationData",
      args: [
        serializeModuleEntity({
          moduleAddress: validationModuleAddress ?? zeroAddress,
          entityId: entityId ?? Number(maxUint32),
        }),
      ],
    });
  };

  const encodeCallData = async (callData: Hex): Promise<Hex> => {
    const validationData = await getValidationData({
      entityId: Number(entityId),
    });
    if (hasAssociatedExecHooks) {
      return concatHex([EXECUTE_USER_OP_SELECTOR, callData]);
    }
    if (validationData.executionHooks.length) {
      return concatHex([EXECUTE_USER_OP_SELECTOR, callData]);
    }
    return callData;
  };

  const prepareSignature = async (
    request: SignatureRequest,
  ): Promise<Extract<SignatureRequest, { type: "eth_signTypedData_v4" }>> => {
    const isDeferredAction =
      request.type === "eth_signTypedData_v4" &&
      request.data?.primaryType === "DeferredAction" &&
      request.data?.domain?.verifyingContract === accountAddress;

    if (isDeferredAction && entityId === DEFAULT_OWNER_ENTITY_ID) {
      return request;
    }

    const hash =
      request.type === "personal_sign"
        ? hashMessage(request.data)
        : request.type === "eth_signTypedData_v4"
          ? hashTypedData(request.data)
          : assertNever(request, "Unexpected signature request type");

    return {
      type: "eth_signTypedData_v4",
      data: toReplaySafeTypedData({
        chainId: client.chain.id,
        hash,
        ...(owner.type === "webAuthn"
          ? {
              address: DefaultModuleAddress.WEBAUTHN_VALIDATION,
              salt: concatHex([`0x${"00".repeat(12)}`, accountAddress]),
            }
          : entityId === DEFAULT_OWNER_ENTITY_ID
            ? { address: accountAddress }
            : {
                address: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
                salt: concatHex([`0x${"00".repeat(12)}`, accountAddress]),
              }),
      }),
    };
  };

  const formatSignature = async (signature: Hex): Promise<Hex> => {
    return pack1271Signature({
      entityId,
      validationSignaturePrefix:
        owner.type === "webAuthn" ? null : SignaturePrefix.EOA,
      validationSignature: signature,
    });
  };

  return await toSmartAccount({
    getFactoryArgs,
    client,
    entryPoint,
    getNonce,
    authorization,

    async getAddress() {
      return accountAddress;
    },

    async encodeCalls(calls) {
      if (calls.length === 1) {
        const call = calls[0];

        if (isAddressEqual(call.to, accountAddress)) {
          // If the call is to the account itself, we need to avoid wrapping it in an `execute` call.

          if (call.data === undefined) {
            throw new BaseError("Data is required for an account self-call.");
          }

          return encodeCallData(call.data);
        }

        return encodeCallData(
          encodeFunctionData({
            abi: modularAccountAbi,
            functionName: "execute",
            args: [call.to, call.value ?? 0n, call.data ?? "0x"],
          }),
        );
      }

      return encodeCallData(
        encodeFunctionData({
          abi: modularAccountAbi,
          functionName: "executeBatch",
          args: [
            calls.map((call) => ({
              target: call.to,
              data: call.data ?? "0x",
              value: call.value ?? 0n,
            })),
          ],
        }),
      );
    },

    async decodeCalls(data) {
      // Inverse of `encodeCalls`.
      // Trim the EXECUTE_USER_OP_SELECTOR if it is present.
      const trimmedData = data
        .toLowerCase()
        .startsWith(EXECUTE_USER_OP_SELECTOR.toLowerCase())
        ? sliceHex(data, 4)
        : data;

      const decoded = decodeFunctionData({
        abi: modularAccountAbi,
        data: trimmedData,
      });

      if (decoded.functionName === "execute") {
        return [
          {
            to: decoded.args[0],
            value: decoded.args[1],
            data: decoded.args[2],
          },
        ];
      }

      if (decoded.functionName === "executeBatch") {
        return decoded.args[0].map((call) => ({
          to: call.target,
          value: call.value,
          data: call.data,
        }));
      }

      // If the data is not for an `execute` or `executeBatch` call, we treat it as a single call to the account itself.
      return [
        {
          to: accountAddress,
          data,
        },
      ];
    },

    async getStubSignature() {
      if (owner.type === "webAuthn") {
        return WEBAUTHN_DUMMY_SIGNATURE;
      }

      const sig = packUOSignature({
        validationSignature:
          "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      });
      return deferredActionData ? concatHex([deferredActionData, sig]) : sig;
    },

    async signMessage({ message }) {
      const { data } = await prepareSignature({
        type: "personal_sign",
        data: message,
      });

      if (owner.type === "webAuthn") {
        const validationSignature = toWebAuthnSignature(
          await owner.sign({ hash: hashTypedData(data) }),
        );
        return formatSignature(validationSignature);
      }

      const action = getAction(client, signTypedData, "signTypedData");

      const signature = await action({
        ...data,
        account: owner,
      });

      return formatSignature(signature);
    },

    async signTypedData(td) {
      const isDeferredAction =
        td.primaryType === "DeferredAction" &&
        td.domain &&
        typeof td.domain === "object" &&
        "verifyingContract" in td.domain &&
        td.domain.verifyingContract === accountAddress;

      const { data } = await prepareSignature({
        type: "eth_signTypedData_v4",
        data: td as TypedDataDefinition, // TODO(v5): Try harder to satisfy this w/o casting.
      });

      if (owner.type === "webAuthn") {
        const validationSignature = toWebAuthnSignature(
          await owner.sign({ hash: hashTypedData(data) }),
        );
        return isDeferredAction
          ? validationSignature
          : formatSignature(validationSignature);
      }

      const action = getAction(client, signTypedData, "signTypedData");

      const signature = await action({
        ...data,
        account: owner,
      });

      return isDeferredAction
        ? concat([SignaturePrefix.EOA, signature])
        : formatSignature(signature);
    },

    async signUserOperation(uo) {
      const hash = getUserOperationHash({
        chainId: uo.chainId ?? client.chain.id,
        entryPointAddress: entryPoint.address,
        entryPointVersion: entryPoint.version,
        userOperation: {
          ...uo,
          sender: accountAddress,
        },
      });

      if (owner.type === "webAuthn") {
        const validationSignature = toWebAuthnSignature(
          await owner.sign({
            hash: hashMessage({ raw: hash }),
          }),
        );

        const signature = deferredActionData
          ? concatHex([deferredActionData, validationSignature])
          : validationSignature;
        deferredActionData = undefined; // clear once used
        hasAssociatedExecHooks = false; // set to falsy value once used
        return concatHex(["0xff", signature]);
      }

      const signMessageAction = getAction(client, signMessage, "signMessage");

      const validationSignature = await signMessageAction({
        account: owner,
        message: { raw: hash },
      });

      const packedSignature = packUOSignature({
        validationSignature,
      });

      const signature = deferredActionData
        ? concatHex([deferredActionData, packedSignature])
        : packedSignature;

      deferredActionData = undefined; // clear once used
      hasAssociatedExecHooks = false; // set to falsy value once used

      return signature;
    },

    userOperation: {
      estimateGas: async (uo) => {
        if (owner.type !== "webAuthn") {
          // Uses the default gas estimator.
          // Note that we get 7702 support automatically from Viem.
          return undefined;
        }

        const estimateGasAction = getAction(
          client,
          estimateUserOperationGas,
          "estimateUserOperationGas",
        );

        const estimate = await estimateGasAction({
          ...(uo as UserOperation<typeof entryPoint.version>),
          entryPointAddress: entryPoint.address,
        });

        const buffer = (await chainHas7212(client)) ? 10000n : 300000n;

        // TODO(v4): iterate numbers. Aim to have ~1000 gas buffer to account for longer authenticatorDatas and clientDataJSONs.
        return {
          ...estimate,
          verificationGasLimit: estimate.verificationGasLimit + buffer,
        };
      },
    },

    extend: {
      smartAccountType: "ModularAccountV2" as const,
      signerEntity: {
        entityId,
        isGlobalValidation,
      },
      encodeCallData,
      getExecutionData,
      getValidationData,
      prepareSignature,
      formatSignature,
    },
  });
}
