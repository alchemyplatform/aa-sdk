import {
  getContract,
  encodeAbiParameters,
  encodeFunctionData,
  type Address,
  type GetContractReturnType,
  type Transport,
  type PublicClient,
  type Client,
  type EncodeFunctionDataParameters,
  type Chain,
  type Hex,
  type ReadContractReturnType,
} from "viem";
import {
  ChainNotFoundError,
  AccountNotFoundError,
  isSmartAccountClient,
  IncompatibleClientError,
  type SmartContractAccount,
  type GetAccountParameter,
  type SendUserOperationResult,
  type GetEntryPointFromAccount,
  type UserOperationOverridesParameter,
  type UserOperationContext,
  type GetContextParameter,
} from "@aa-sdk/core";
import {
  installPlugin as installPlugin_,
  type Plugin,
  type FunctionReference,
} from "@account-kit/smart-contracts";

type ExecutionActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  updateOwnership: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof MultisigPluginExecutionFunctionAbi,
        "updateOwnership"
      >,
      "args"
    > &
      UserOperationOverridesParameter<TEntryPointVersion> &
      GetAccountParameter<TAccount> &
      GetContextParameter<TContext>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
};

type InstallArgs = [{ type: "address[]" }, { type: "uint256" }];

export type InstallMultisigPluginParams = {
  args: Parameters<typeof encodeAbiParameters<InstallArgs>>[1];
  pluginAddress?: Address;
  dependencyOverrides?: FunctionReference[];
};

type ManagementActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | Record<string, any>
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  installMultisigPlugin: (
    args: UserOperationOverridesParameter<TEntryPointVersion> &
      InstallMultisigPluginParams &
      GetAccountParameter<TAccount> &
      GetContextParameter<TContext>
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
};

type ReadAndEncodeActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
> = {
  encodeUpdateOwnership: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof MultisigPluginExecutionFunctionAbi,
        "updateOwnership"
      >,
      "args"
    >
  ) => Hex;

  encodeEip712Domain: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof MultisigPluginExecutionFunctionAbi,
        "eip712Domain"
      >,
      "args"
    >
  ) => Hex;

  readEip712Domain: (
    args: GetAccountParameter<TAccount>
  ) => Promise<
    ReadContractReturnType<
      typeof MultisigPluginExecutionFunctionAbi,
      "eip712Domain"
    >
  >;

  encodeIsValidSignature: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof MultisigPluginExecutionFunctionAbi,
        "isValidSignature"
      >,
      "args"
    >
  ) => Hex;

  readIsValidSignature: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof MultisigPluginExecutionFunctionAbi,
        "isValidSignature"
      >,
      "args"
    > &
      GetAccountParameter<TAccount>
  ) => Promise<
    ReadContractReturnType<
      typeof MultisigPluginExecutionFunctionAbi,
      "isValidSignature"
    >
  >;
};

export type MultisigPluginActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = ExecutionActions<TAccount, TContext> &
  ManagementActions<TAccount, TContext> &
  ReadAndEncodeActions<TAccount>;

const addresses = {
  1: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  10: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  137: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  252: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  2523: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  8453: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  42161: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  80002: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  84532: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  421614: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  7777777: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  11155111: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  11155420: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
  999999999: "0x000000000000A53f64b7bcf4Cd59624943C43Fc7" as Address,
} as Record<number, Address>;

export const MultisigPlugin: Plugin<typeof MultisigPluginAbi> = {
  meta: {
    name: "Multisig Plugin",
    version: "1.0.0",
    addresses,
  },
  getContract: <C extends Client>(
    client: C,
    address?: Address
  ): GetContractReturnType<typeof MultisigPluginAbi, PublicClient, Address> => {
    if (!client.chain) throw new ChainNotFoundError();

    return getContract({
      address: address || addresses[client.chain.id],
      abi: MultisigPluginAbi,
      client: client,
    }) as GetContractReturnType<
      typeof MultisigPluginAbi,
      PublicClient,
      Address
    >;
  },
};

export const multisigPluginActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>
) => MultisigPluginActions<TAccount, TContext> = (client) => ({
  updateOwnership({ args, overrides, context, account = client.account }) {
    if (!account) {
      throw new AccountNotFoundError();
    }
    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "updateOwnership",
        client
      );
    }

    const uo = encodeFunctionData({
      abi: MultisigPluginExecutionFunctionAbi,
      functionName: "updateOwnership",
      args,
    });

    return client.sendUserOperation({ uo, overrides, account, context });
  },
  installMultisigPlugin({
    account = client.account,
    overrides,
    context,
    ...params
  }) {
    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "installMultisigPlugin",
        client
      );
    }

    const chain = client.chain;
    if (!chain) {
      throw new ChainNotFoundError();
    }

    const dependencies = params.dependencyOverrides ?? [];
    const pluginAddress =
      params.pluginAddress ??
      (MultisigPlugin.meta.addresses[chain.id] as Address | undefined);

    if (!pluginAddress) {
      throw new Error("missing MultisigPlugin address for chain " + chain.name);
    }

    return installPlugin_(client, {
      pluginAddress,
      pluginInitData: encodeAbiParameters(
        [{ type: "address[]" }, { type: "uint256" }],
        params.args
      ),
      dependencies,
      overrides,
      account,
      context,
    });
  },
  encodeUpdateOwnership({ args }) {
    return encodeFunctionData({
      abi: MultisigPluginExecutionFunctionAbi,
      functionName: "updateOwnership",
      args,
    });
  },
  encodeEip712Domain() {
    return encodeFunctionData({
      abi: MultisigPluginExecutionFunctionAbi,
      functionName: "eip712Domain",
    });
  },

  async readEip712Domain({ account = client.account }) {
    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "readEip712Domain",
        client
      );
    }

    return client.readContract({
      address: account.address,
      abi: MultisigPluginExecutionFunctionAbi,
      functionName: "eip712Domain",
    });
  },
  encodeIsValidSignature({ args }) {
    return encodeFunctionData({
      abi: MultisigPluginExecutionFunctionAbi,
      functionName: "isValidSignature",
      args,
    });
  },

  async readIsValidSignature({ args, account = client.account }) {
    if (!account) {
      throw new AccountNotFoundError();
    }

    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "readIsValidSignature",
        client
      );
    }

    return client.readContract({
      address: account.address,
      abi: MultisigPluginExecutionFunctionAbi,
      functionName: "isValidSignature",
      args,
    });
  },
});

export const MultisigPluginExecutionFunctionAbi = [
  {
    type: "function",
    name: "updateOwnership",
    inputs: [
      { name: "ownersToAdd", type: "address[]", internalType: "address[]" },
      { name: "ownersToRemove", type: "address[]", internalType: "address[]" },
      { name: "newThreshold", type: "uint128", internalType: "uint128" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "eip712Domain",
    inputs: [],
    outputs: [
      { name: "fields", type: "bytes1", internalType: "bytes1" },
      { name: "name", type: "string", internalType: "string" },
      { name: "version", type: "string", internalType: "string" },
      { name: "chainId", type: "uint256", internalType: "uint256" },
      { name: "verifyingContract", type: "address", internalType: "address" },
      { name: "salt", type: "bytes32", internalType: "bytes32" },
      { name: "extensions", type: "uint256[]", internalType: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isValidSignature",
    inputs: [
      { name: "digest", type: "bytes32", internalType: "bytes32" },
      { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "view",
  },
] as const;

export const MultisigPluginAbi = [
  {
    type: "constructor",
    inputs: [{ name: "entryPoint", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ENTRYPOINT",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "checkNSignatures",
    inputs: [
      { name: "actualDigest", type: "bytes32", internalType: "bytes32" },
      { name: "upperLimitGasDigest", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
      { name: "signatures", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
      { name: "success", type: "bool", internalType: "bool" },
      { name: "firstFailure", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "eip712Domain",
    inputs: [],
    outputs: [
      { name: "fields", type: "bytes1", internalType: "bytes1" },
      { name: "name", type: "string", internalType: "string" },
      { name: "version", type: "string", internalType: "string" },
      { name: "chainId", type: "uint256", internalType: "uint256" },
      { name: "verifyingContract", type: "address", internalType: "address" },
      { name: "salt", type: "bytes32", internalType: "bytes32" },
      { name: "extensions", type: "uint256[]", internalType: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "encodeMessageData",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "message", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMessageHash",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "message", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isOwnerOf",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "ownerToCheck", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isValidSignature",
    inputs: [
      { name: "digest", type: "bytes32", internalType: "bytes32" },
      { name: "signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "onInstall",
    inputs: [{ name: "data", type: "bytes", internalType: "bytes" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onUninstall",
    inputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ownershipInfoOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [
      { name: "", type: "address[]", internalType: "address[]" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pluginManifest",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct PluginManifest",
        components: [
          { name: "interfaceIds", type: "bytes4[]", internalType: "bytes4[]" },
          {
            name: "dependencyInterfaceIds",
            type: "bytes4[]",
            internalType: "bytes4[]",
          },
          {
            name: "executionFunctions",
            type: "bytes4[]",
            internalType: "bytes4[]",
          },
          {
            name: "permittedExecutionSelectors",
            type: "bytes4[]",
            internalType: "bytes4[]",
          },
          {
            name: "permitAnyExternalAddress",
            type: "bool",
            internalType: "bool",
          },
          { name: "canSpendNativeToken", type: "bool", internalType: "bool" },
          {
            name: "permittedExternalCalls",
            type: "tuple[]",
            internalType: "struct ManifestExternalCallPermission[]",
            components: [
              {
                name: "externalAddress",
                type: "address",
                internalType: "address",
              },
              { name: "permitAnySelector", type: "bool", internalType: "bool" },
              { name: "selectors", type: "bytes4[]", internalType: "bytes4[]" },
            ],
          },
          {
            name: "userOpValidationFunctions",
            type: "tuple[]",
            internalType: "struct ManifestAssociatedFunction[]",
            components: [
              {
                name: "executionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "associatedFunction",
                type: "tuple",
                internalType: "struct ManifestFunction",
                components: [
                  {
                    name: "functionType",
                    type: "uint8",
                    internalType: "enum ManifestAssociatedFunctionType",
                  },
                  { name: "functionId", type: "uint8", internalType: "uint8" },
                  {
                    name: "dependencyIndex",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
          {
            name: "runtimeValidationFunctions",
            type: "tuple[]",
            internalType: "struct ManifestAssociatedFunction[]",
            components: [
              {
                name: "executionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "associatedFunction",
                type: "tuple",
                internalType: "struct ManifestFunction",
                components: [
                  {
                    name: "functionType",
                    type: "uint8",
                    internalType: "enum ManifestAssociatedFunctionType",
                  },
                  { name: "functionId", type: "uint8", internalType: "uint8" },
                  {
                    name: "dependencyIndex",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
          {
            name: "preUserOpValidationHooks",
            type: "tuple[]",
            internalType: "struct ManifestAssociatedFunction[]",
            components: [
              {
                name: "executionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "associatedFunction",
                type: "tuple",
                internalType: "struct ManifestFunction",
                components: [
                  {
                    name: "functionType",
                    type: "uint8",
                    internalType: "enum ManifestAssociatedFunctionType",
                  },
                  { name: "functionId", type: "uint8", internalType: "uint8" },
                  {
                    name: "dependencyIndex",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
          {
            name: "preRuntimeValidationHooks",
            type: "tuple[]",
            internalType: "struct ManifestAssociatedFunction[]",
            components: [
              {
                name: "executionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "associatedFunction",
                type: "tuple",
                internalType: "struct ManifestFunction",
                components: [
                  {
                    name: "functionType",
                    type: "uint8",
                    internalType: "enum ManifestAssociatedFunctionType",
                  },
                  { name: "functionId", type: "uint8", internalType: "uint8" },
                  {
                    name: "dependencyIndex",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
          {
            name: "executionHooks",
            type: "tuple[]",
            internalType: "struct ManifestExecutionHook[]",
            components: [
              {
                name: "executionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "preExecHook",
                type: "tuple",
                internalType: "struct ManifestFunction",
                components: [
                  {
                    name: "functionType",
                    type: "uint8",
                    internalType: "enum ManifestAssociatedFunctionType",
                  },
                  { name: "functionId", type: "uint8", internalType: "uint8" },
                  {
                    name: "dependencyIndex",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
              {
                name: "postExecHook",
                type: "tuple",
                internalType: "struct ManifestFunction",
                components: [
                  {
                    name: "functionType",
                    type: "uint8",
                    internalType: "enum ManifestAssociatedFunctionType",
                  },
                  { name: "functionId", type: "uint8", internalType: "uint8" },
                  {
                    name: "dependencyIndex",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "pluginMetadata",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct PluginMetadata",
        components: [
          { name: "name", type: "string", internalType: "string" },
          { name: "version", type: "string", internalType: "string" },
          { name: "author", type: "string", internalType: "string" },
          {
            name: "permissionDescriptors",
            type: "tuple[]",
            internalType: "struct SelectorPermission[]",
            components: [
              {
                name: "functionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "permissionDescription",
                type: "string",
                internalType: "string",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "postExecutionHook",
    inputs: [
      { name: "functionId", type: "uint8", internalType: "uint8" },
      { name: "preExecHookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "preExecutionHook",
    inputs: [
      { name: "functionId", type: "uint8", internalType: "uint8" },
      { name: "sender", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "preRuntimeValidationHook",
    inputs: [
      { name: "functionId", type: "uint8", internalType: "uint8" },
      { name: "sender", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "preUserOpValidationHook",
    inputs: [
      { name: "functionId", type: "uint8", internalType: "uint8" },
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct UserOperation",
        components: [
          { name: "sender", type: "address", internalType: "address" },
          { name: "nonce", type: "uint256", internalType: "uint256" },
          { name: "initCode", type: "bytes", internalType: "bytes" },
          { name: "callData", type: "bytes", internalType: "bytes" },
          { name: "callGasLimit", type: "uint256", internalType: "uint256" },
          {
            name: "verificationGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "maxFeePerGas", type: "uint256", internalType: "uint256" },
          {
            name: "maxPriorityFeePerGas",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "paymasterAndData", type: "bytes", internalType: "bytes" },
          { name: "signature", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "userOpHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "runtimeValidationFunction",
    inputs: [
      { name: "functionId", type: "uint8", internalType: "uint8" },
      { name: "sender", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [{ name: "interfaceId", type: "bytes4", internalType: "bytes4" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "updateOwnership",
    inputs: [
      { name: "ownersToAdd", type: "address[]", internalType: "address[]" },
      { name: "ownersToRemove", type: "address[]", internalType: "address[]" },
      { name: "newThreshold", type: "uint128", internalType: "uint128" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "userOpValidationFunction",
    inputs: [
      { name: "functionId", type: "uint8", internalType: "uint8" },
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct UserOperation",
        components: [
          { name: "sender", type: "address", internalType: "address" },
          { name: "nonce", type: "uint256", internalType: "uint256" },
          { name: "initCode", type: "bytes", internalType: "bytes" },
          { name: "callData", type: "bytes", internalType: "bytes" },
          { name: "callGasLimit", type: "uint256", internalType: "uint256" },
          {
            name: "verificationGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "maxFeePerGas", type: "uint256", internalType: "uint256" },
          {
            name: "maxPriorityFeePerGas",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "paymasterAndData", type: "bytes", internalType: "bytes" },
          { name: "signature", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "userOpHash", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "OwnerUpdated",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "addedOwners",
        type: "address[]",
        indexed: false,
        internalType: "address[]",
      },
      {
        name: "removedOwners",
        type: "address[]",
        indexed: false,
        internalType: "address[]",
      },
      {
        name: "threshold",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "AlreadyInitialized", inputs: [] },
  { type: "error", name: "ECDSARecoverFailure", inputs: [] },
  { type: "error", name: "EmptyOwnersNotAllowed", inputs: [] },
  { type: "error", name: "InvalidAction", inputs: [] },
  { type: "error", name: "InvalidAddress", inputs: [] },
  { type: "error", name: "InvalidMaxFeePerGas", inputs: [] },
  { type: "error", name: "InvalidMaxPriorityFeePerGas", inputs: [] },
  { type: "error", name: "InvalidNumSigsOnActualGas", inputs: [] },
  {
    type: "error",
    name: "InvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  { type: "error", name: "InvalidPreVerificationGas", inputs: [] },
  { type: "error", name: "InvalidSigLength", inputs: [] },
  { type: "error", name: "InvalidSigOffset", inputs: [] },
  { type: "error", name: "InvalidThreshold", inputs: [] },
  {
    type: "error",
    name: "NotContractCaller",
    inputs: [{ name: "caller", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "NotImplemented",
    inputs: [
      { name: "selector", type: "bytes4", internalType: "bytes4" },
      { name: "functionId", type: "uint8", internalType: "uint8" },
    ],
  },
  { type: "error", name: "NotInitialized", inputs: [] },
  {
    type: "error",
    name: "OwnerDoesNotExist",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
] as const;
