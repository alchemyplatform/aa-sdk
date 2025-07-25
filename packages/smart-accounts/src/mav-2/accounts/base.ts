import {
  type Address,
  type Hex,
  type Abi,
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
} from "viem";
import {
  entryPoint07Abi,
  type SmartAccountImplementation,
  type SmartAccount,
  entryPoint07Address,
  getUserOperationHash,
  toSmartAccount,
  type WebAuthnAccount,
} from "viem/account-abstraction";
import type { SignatureRequest } from "../../light-account/types.js"; // TODO(jh): this should be shared
import {
  getCode,
  readContract,
  signMessage,
  signTypedData,
} from "viem/actions";
import { BaseError } from "@alchemy/common";
import { DEFAULT_OWNER_ENTITY_ID, parseDeferredAction } from "../utils.js";

export const executeUserOpSelector: Hex = "0x8DD7712F";

// TODO(jh): ideally viem abstracts away the normal vs webauthn signer & this isn't needed at all.
// export type ModularAccountsV2 =
//   | BaseModularAccountV2Implementation
//   | WebauthnModularAccountV2;

export type SignerEntity = {
  isGlobalValidation: boolean;
  entityId: number;
};

export type ExecutionDataView = {
  module: Address;
  skipRuntimeValidation: boolean;
  allowGlobalValidation: boolean;
  executionHooks: readonly Hex[];
};

export type ValidationDataView = {
  validationHooks: readonly Hex[];
  executionHooks: readonly Hex[];
  selectors: readonly Hex[];
  validationFlags: number;
};

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
    // TODO(jh): should these live here or not on the base?
    prepareSignature: (request: SignatureRequest) => Promise<SignatureRequest>;
    formatSignature: (signature: Hex) => Promise<Hex>;
    // TODO(jh): what do we need the rest of this?
    signerEntity: SignerEntity;
    getExecutionData: (selector: Hex) => Promise<ExecutionDataView>;
    getValidationData: (
      args: ValidationDataParams,
    ) => Promise<ValidationDataView>;
    // encodeCallData: (callData: Hex) => Promise<Hex>;
  },
  false // TODO(jh): this generic param is a `eip7702` bool... may need to use it elsewhere.
>;

export type ModularAccountV2Base =
  SmartAccount<BaseModularAccountV2Implementation>;

export type CreateModularAccountV2BaseParams<
  TTransport extends Transport = Transport,
> = {
  client: Client<TTransport, Chain, JsonRpcAccount | LocalAccount | undefined>;
  // Required for Webauthn b/c it can't be hoisted on a Client. Optional if
  // there's already an account hoisted on the client.
  owner?: LocalAccount | WebAuthnAccount;
  abi: Abi;
  accountAddress: Address;
  // TODO(jh): need this here like we added to Light Account or nah?
  //   getFactoryArgs: () => Promise<{
  //     factory?: Address | undefined;
  //     factoryData?: Hex | undefined;
  //   }>;
  signerEntity?: SignerEntity;
  deferredAction?: Hex;
};

// TODO(jh): maybe wherever this is used, we should have 2 diff functions
// for creating Webauthn or standard? or maybe even consider having 2 overloads
// here like we did in v4, but idk how i feel about that when this is the "base"...
export async function createModularAccountV2Base<
  TTransport extends Transport = Transport,
>({
  client,
  owner: owner_,
  abi,
  accountAddress,
  // getFactoryArgs // TODO(jh): remove if not used
  signerEntity = {
    isGlobalValidation: true,
    entityId: DEFAULT_OWNER_ENTITY_ID,
  },
  deferredAction,
}: CreateModularAccountV2BaseParams<TTransport>): Promise<ModularAccountV2Base> {
  // TODO(jh): do we need to impl `encodeUpgradeToAndCall` like Light Account has?

  // TODO(jh): impl prepare & format sign (depends on entityId & webauthn or not)
  // TODO(jh): should we have different factory functions for each type or just use params to set it?

  const owner = owner_ ?? client.account;
  if (!owner) {
    throw new BaseError(
      "Account must exist on client or be passed as the `owner`.",
    );
  }
  // TODO(jh): owner.type here tells us if it's webauthn.

  let { isGlobalValidation, entityId } = signerEntity;

  const entryPoint = {
    abi: entryPoint07Abi,
    address: entryPoint07Address as Address,
    version: "0.7" as const,
  };

  if (entityId > Number(maxUint32)) {
    throw new InvalidEntityIdError(entityId); // TODO(jh): add this error to common
  }

  const transport = client.transport;
  const chain = client.chain;

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

    // Set these values if the deferred action has not been consumed. We check this with the EP
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
      throw new InvalidDeferredActionNonce(); // TODO(jh): add this error to common
    }
  }

  // TODO(jh): continue here from `encodeExecute` in the old `modularAccountV2Base`...

  // TODO(jh): look back at this:
  // https://github.com/wevm/viem/blob/f82cdd929062c0d079142de1555a472f78ac59e1/src/account-abstraction/accounts/types.ts#L29
  // see things like getNonce exist on it. anything else we need that's optional?

  return await toSmartAccount({
    getFactoryArgs, // TODO(jh): i think we actually need this to make viem happy.
    client,
    entryPoint,

    async getAddress() {
      return accountAddress;
    },

    async encodeCalls(calls) {
      if (calls.length === 1) {
        const call = calls[0];
        return encodeFunctionData({
          abi, // TODO(jh): should we just hardcode this?
          functionName: "execute",
          args: [call.to, call.value ?? 0n, call.data ?? "0x"],
        });
      }

      return encodeFunctionData({
        abi, // TODO(jh): should we just hardcode this?
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

    // TODO(jh): impl
    // async getStubSignature() {
    //   const signature =
    //     "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";

    //   switch (version) {
    //     case "v1.0.1":
    //     case "v1.0.2":
    //     case "v1.1.0":
    //       return signature;
    //     case "v2.0.0":
    //       return concat([SignaturePrefix.EOA, signature]);
    //     default:
    //       throw new BaseError(`Unknown version ${type} of ${String(version)}`);
    //   }
    // },

    // TODO(jh): impl
    // async signMessage({ message }) {
    //   const { type, data } = await prepareSignature({
    //     type: "personal_sign",
    //     data: message,
    //   });

    //   const sig =
    //     type === "eth_signTypedData_v4"
    //       ? await signTypedData(client, data)
    //       : await signMessage(client, { message });

    //   return formatSignature(sig);
    // },

    // TODO(jh): impl
    // async signTypedData(params) {
    //   const { type, data } = await prepareSignature({
    //     type: "eth_signTypedData_v4",
    //     data: params as TypedDataDefinition,
    //   });

    //   const sig =
    //     type === "eth_signTypedData_v4"
    //       ? await signTypedData(client, data)
    //       : await signMessage(client, { message: data });

    //   return formatSignature(sig);
    // },

    // TODO(jh): impl
    // async signUserOperation(parameters) {
    //   const { chainId = client.chain.id, ...userOperation } = parameters;
    //   const userOpHash = getUserOperationHash({
    //     chainId,
    //     entryPointAddress: entryPoint.address,
    //     entryPointVersion: entryPoint.version,
    //     userOperation: {
    //       ...userOperation,
    //       sender: accountAddress,
    //     },
    //   });

    //   const signature = await signMessage(client, {
    //     message: { raw: userOpHash },
    //   });

    //   return version === "v2.0.0"
    //     ? concatHex([SignaturePrefix.EOA, signature])
    //     : signature;
    // },

    // Extension properties
    extend: {
      source: "ModularAccountV2" as const,
      prepareSignature,
      formatSignature,
      signerEntity,
      getExecutionData, // TODO(jh): impl
      getValidationData, // TODO(jh): impl
    },
  });
}

// TODO(jh): do we really want a different BASE type for this?
// probably not since viem is handling our signer account now.
// and viem also supports webauthn accounts internally:
// https://viem.sh/account-abstraction/accounts/webauthn
// so we need to figure out how to make that work... might
// want to use some generic on the base mav2 acct possibly?

// export type WebauthnModularAccountV2 = SmartContractAccount<
//   "ModularAccountV2",
//   "0.7.0"
// > & {
//   params: ToWebAuthnAccountParameters;
//   signerEntity: SignerEntity;
//   getExecutionData: (selector: Hex) => Promise<ExecutionDataView>;
//   getValidationData: (
//     args: ValidationDataParams,
//   ) => Promise<ValidationDataView>;
//   encodeCallData: (callData: Hex) => Promise<Hex>;
// };

// export type CreateWebauthnMAV2BaseParams = Omit<
//   CreateMAV2BaseParams,
//   "signer"
// > & {
//   credential: ToWebAuthnAccountParameters["credential"];
//   getFn?: ToWebAuthnAccountParameters["getFn"] | undefined;
//   rpId?: ToWebAuthnAccountParameters["rpId"] | undefined;
// };
