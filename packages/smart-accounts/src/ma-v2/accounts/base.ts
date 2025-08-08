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
  toHex,
} from "viem";
import {
  entryPoint07Abi,
  type SmartAccountImplementation,
  type SmartAccount,
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
import type { SignatureRequest } from "../../types.js";
import { getAction } from "viem/utils";
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
} from "../utils/signature.js";
import { chainHas7212 } from "../../utils.js";
import { InvalidDeferredActionNonceError } from "../../errors/InvalidDeferredActionNonceError.js";
import { InvalidNonceKeyError } from "../../errors/InvalidNonceKeyError.js";
import { InvalidEntityIdError } from "../../errors/InvalidEntityIdError.js";

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
    source: "ModularAccountV2";
    signerEntity: SignerEntity;
    encodeCallData: (callData: Hex) => Promise<Hex>;
    getExecutionData: (selector: Hex) => Promise<ExecutionDataView>;
    getValidationData: (
      args: ValidationDataParams
    ) => Promise<ValidationDataView>;
    prepareSignature: (request: SignatureRequest) => Promise<SignatureRequest>;
    formatSignature: (signature: Hex) => Promise<Hex>;
  },
  boolean
>;

export type ModularAccountV2Base =
  SmartAccount<BaseModularAccountV2Implementation>;

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

export async function toModularAccountV2Base<
  TTransport extends Transport = Transport,
>(
  params: ToModularAccountV2BaseParams<TTransport>
): Promise<ModularAccountV2Base>;
export async function toModularAccountV2Base<
  TTransport extends Transport = Transport,
>(
  params: ToModularAccountV2BaseParams<TTransport>
): Promise<ModularAccountV2Base>;
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

  const isAccountDeployed: () => Promise<boolean> = async () =>
    !!(await getCode(client, { address: accountAddress }));

  // These default values signal that we should not use the set deferred action nonce
  let nonce: bigint | undefined;
  let deferredActionData: Hex | undefined;
  let hasAssociatedExecHooks: boolean = false;

  if (deferredAction) {
    let deferredActionNonce: bigint = 0n;
    // We always update entity id and isGlobalValidation to the deferred action value since the client could be used to send multiple calls
    ({
      entityId,
      isGlobalValidation,
      nonce: deferredActionNonce,
    } = parseDeferredAction(deferredAction));

    // Set these values if the deferred action has not been consumed. We check this with the EP.
    const nextNonceForDeferredAction: bigint = await readContract(client, {
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
    params?: { key?: bigint | undefined } | undefined
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

    return readContract(client, {
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
    return readContract(client, {
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
      hasAssociatedExecHooks = false; // set to falsy value once used
      return concatHex([EXECUTE_USER_OP_SELECTOR, callData]);
    }
    if (validationData.executionHooks.length) {
      return concatHex([EXECUTE_USER_OP_SELECTOR, callData]);
    }
    return callData;
  };

  const prepareSignature = async (
    request: SignatureRequest
  ): Promise<Extract<SignatureRequest, { type: "eth_signTypedData_v4" }>> => {
    if (owner.type === "webAuthn") {
      throw new BaseError(
        "`prepareSignature` not supported by WebAuthn signer"
      );
    }

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
        ...(entityId === DEFAULT_OWNER_ENTITY_ID
          ? { address: accountAddress }
          : {
              address: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
              salt: concatHex([`0x${"00".repeat(12)}`, accountAddress]),
            }),
      }),
    };
  };

  const formatSignature = async (signature: Hex): Promise<Hex> => {
    if (owner.type === "webAuthn") {
      throw new BaseError("`formatSignature` not supported by WebAuthn signer");
    }
    return pack1271Signature({
      validationSignature: signature,
      entityId,
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
        return encodeFunctionData({
          abi: modularAccountAbi,
          functionName: "execute",
          args: [call.to, call.value ?? 0n, call.data ?? "0x"],
        });
      }

      return encodeFunctionData({
        abi: modularAccountAbi,
        functionName: "executeBatch",
        args: [
          calls.map((call) => ({
            target: call.to,
            data: call.data ?? "0x",
            value: call.value ?? 0n,
          })),
        ],
      });
    },

    async getStubSignature() {
      if (owner.type === "webAuthn") {
        return "0xff000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000";
      }

      const sig = packUOSignature({
        validationSignature:
          "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      });
      return deferredActionData ? concatHex([deferredActionData, sig]) : sig;
    },

    async signMessage({ message }) {
      if (owner.type === "webAuthn") {
        const hash = hashTypedData(
          toReplaySafeTypedData({
            chainId: client.chain.id,
            address: DefaultModuleAddress.WEBAUTHN_VALIDATION,
            hash: hashMessage(message),
          })
        );
        const validationSignature = toWebAuthnSignature(
          await owner.sign({ hash })
        );
        return pack1271Signature({
          validationSignature,
          entityId,
        });
      }

      const { data } = await prepareSignature({
        type: "personal_sign",
        data: message,
      });

      const action = getAction(client, signTypedData, "signTypedData");

      const signature = await action({
        ...data,
        account: owner,
      });

      return formatSignature(signature);
    },

    async signTypedData(td) {
      // TODO(jh): extract to util function.
      const isDeferredAction =
        td.primaryType === "DeferredAction" &&
        td.domain &&
        typeof td.domain === "object" &&
        "verifyingContract" in td.domain &&
        td.domain.verifyingContract === accountAddress;

      if (owner.type === "webAuthn") {
        const hash = hashTypedData(
          toReplaySafeTypedData({
            chainId: client.chain.id,
            address: DefaultModuleAddress.WEBAUTHN_VALIDATION,
            hash: hashTypedData(td),
            salt: concatHex([`0x${"00".repeat(12)}`, accountAddress]),
          })
        );
        const validationSignature = toWebAuthnSignature(
          await owner.sign({ hash })
        );
        return isDeferredAction
          ? pack1271Signature({
              validationSignature,
              entityId,
            })
          : validationSignature;
      }

      const { data } = await prepareSignature({
        type: "eth_signTypedData_v4",
        data: td as TypedDataDefinition, // TODO: Try harder to satisfy this w/o casting.
      });

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
          })
        );

        const signature = deferredActionData
          ? concatHex([deferredActionData, validationSignature])
          : validationSignature;
        deferredActionData = undefined;
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

      deferredActionData = undefined;

      return signature;
    },

    userOperation: {
      estimateGas: async (uo) => {
        if (owner.type !== "webAuthn") {
          // TODO(jh): remove
          console.log({
            entityId,
            accountAddress,
            ownerAddress: owner.address,
            uo,
          });

          // Uses the default gas estimator.
          // Note that we get 7702 support automatically from Viem.
          return undefined;
        }

        const estimateGasAction = getAction(
          client,
          estimateUserOperationGas,
          "estimateUserOperationGas"
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
      source: "ModularAccountV2" as const,
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
