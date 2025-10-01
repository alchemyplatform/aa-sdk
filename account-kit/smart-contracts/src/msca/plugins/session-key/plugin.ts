import {
  getContract,
  encodePacked,
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
import { MultiOwnerPlugin } from "../multi-owner/plugin.js";

type ExecutionActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends
    GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
> = {
  executeWithSessionKey: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof SessionKeyPluginExecutionFunctionAbi,
        "executeWithSessionKey"
      >,
      "args"
    > &
      UserOperationOverridesParameter<TEntryPointVersion> &
      GetAccountParameter<TAccount> &
      GetContextParameter<TContext>,
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;

  addSessionKey: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof SessionKeyPluginExecutionFunctionAbi,
        "addSessionKey"
      >,
      "args"
    > &
      UserOperationOverridesParameter<TEntryPointVersion> &
      GetAccountParameter<TAccount> &
      GetContextParameter<TContext>,
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;

  removeSessionKey: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof SessionKeyPluginExecutionFunctionAbi,
        "removeSessionKey"
      >,
      "args"
    > &
      UserOperationOverridesParameter<TEntryPointVersion> &
      GetAccountParameter<TAccount> &
      GetContextParameter<TContext>,
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;

  rotateSessionKey: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof SessionKeyPluginExecutionFunctionAbi,
        "rotateSessionKey"
      >,
      "args"
    > &
      UserOperationOverridesParameter<TEntryPointVersion> &
      GetAccountParameter<TAccount> &
      GetContextParameter<TContext>,
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;

  updateKeyPermissions: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof SessionKeyPluginExecutionFunctionAbi,
        "updateKeyPermissions"
      >,
      "args"
    > &
      UserOperationOverridesParameter<TEntryPointVersion> &
      GetAccountParameter<TAccount> &
      GetContextParameter<TContext>,
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
};

type InstallArgs = [
  { type: "address[]"; name: "initialKeys" },
  { type: "bytes32[]"; name: "tags" },
  { type: "bytes[][]"; name: "initialPermissions" },
];

export type InstallSessionKeyPluginParams = {
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
  TEntryPointVersion extends
    GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>,
> = {
  installSessionKeyPlugin: (
    args: UserOperationOverridesParameter<TEntryPointVersion> &
      InstallSessionKeyPluginParams &
      GetAccountParameter<TAccount> &
      GetContextParameter<TContext>,
  ) => Promise<SendUserOperationResult<TEntryPointVersion>>;
};

type ReadAndEncodeActions = {
  encodeExecuteWithSessionKey: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof SessionKeyPluginExecutionFunctionAbi,
        "executeWithSessionKey"
      >,
      "args"
    >,
  ) => Hex;

  encodeAddSessionKey: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof SessionKeyPluginExecutionFunctionAbi,
        "addSessionKey"
      >,
      "args"
    >,
  ) => Hex;

  encodeRemoveSessionKey: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof SessionKeyPluginExecutionFunctionAbi,
        "removeSessionKey"
      >,
      "args"
    >,
  ) => Hex;

  encodeRotateSessionKey: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof SessionKeyPluginExecutionFunctionAbi,
        "rotateSessionKey"
      >,
      "args"
    >,
  ) => Hex;

  encodeUpdateKeyPermissions: (
    args: Pick<
      EncodeFunctionDataParameters<
        typeof SessionKeyPluginExecutionFunctionAbi,
        "updateKeyPermissions"
      >,
      "args"
    >,
  ) => Hex;
};

export type SessionKeyPluginActions<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
> = ExecutionActions<TAccount, TContext> &
  ManagementActions<TAccount, TContext> &
  ReadAndEncodeActions;

const addresses = {
  1: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  10: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  137: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  252: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  2523: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  8453: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  42161: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  80001: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  80002: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  84532: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  421614: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  7777777: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  11155111: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  11155420: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
  999999999: "0x0000003E0000a96de4058e1E02a62FaaeCf23d8d" as Address,
} as Record<number, Address>;

export const SessionKeyPlugin: Plugin<typeof SessionKeyPluginAbi> = {
  meta: {
    name: "Session Key Plugin",
    version: "1.0.1",
    addresses,
  },
  getContract: <C extends Client>(
    client: C,
    address?: Address,
  ): GetContractReturnType<
    typeof SessionKeyPluginAbi,
    PublicClient,
    Address
  > => {
    if (!client.chain) throw new ChainNotFoundError();

    return getContract({
      address: address || addresses[client.chain.id],
      abi: SessionKeyPluginAbi,
      client: client,
    }) as GetContractReturnType<
      typeof SessionKeyPluginAbi,
      PublicClient,
      Address
    >;
  },
};

export const sessionKeyPluginActions: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
) => SessionKeyPluginActions<TAccount, TContext> = (client) => ({
  executeWithSessionKey({
    args,
    overrides,
    context,
    account = client.account,
  }) {
    if (!account) {
      throw new AccountNotFoundError();
    }
    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "executeWithSessionKey",
        client,
      );
    }

    const uo = encodeFunctionData({
      abi: SessionKeyPluginExecutionFunctionAbi,
      functionName: "executeWithSessionKey",
      args,
    });

    return client.sendUserOperation({ uo, overrides, account, context });
  },
  addSessionKey({ args, overrides, context, account = client.account }) {
    if (!account) {
      throw new AccountNotFoundError();
    }
    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "addSessionKey",
        client,
      );
    }

    const uo = encodeFunctionData({
      abi: SessionKeyPluginExecutionFunctionAbi,
      functionName: "addSessionKey",
      args,
    });

    return client.sendUserOperation({ uo, overrides, account, context });
  },
  removeSessionKey({ args, overrides, context, account = client.account }) {
    if (!account) {
      throw new AccountNotFoundError();
    }
    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "removeSessionKey",
        client,
      );
    }

    const uo = encodeFunctionData({
      abi: SessionKeyPluginExecutionFunctionAbi,
      functionName: "removeSessionKey",
      args,
    });

    return client.sendUserOperation({ uo, overrides, account, context });
  },
  rotateSessionKey({ args, overrides, context, account = client.account }) {
    if (!account) {
      throw new AccountNotFoundError();
    }
    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "rotateSessionKey",
        client,
      );
    }

    const uo = encodeFunctionData({
      abi: SessionKeyPluginExecutionFunctionAbi,
      functionName: "rotateSessionKey",
      args,
    });

    return client.sendUserOperation({ uo, overrides, account, context });
  },
  updateKeyPermissions({ args, overrides, context, account = client.account }) {
    if (!account) {
      throw new AccountNotFoundError();
    }
    if (!isSmartAccountClient(client)) {
      throw new IncompatibleClientError(
        "SmartAccountClient",
        "updateKeyPermissions",
        client,
      );
    }

    const uo = encodeFunctionData({
      abi: SessionKeyPluginExecutionFunctionAbi,
      functionName: "updateKeyPermissions",
      args,
    });

    return client.sendUserOperation({ uo, overrides, account, context });
  },
  installSessionKeyPlugin({
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
        "installSessionKeyPlugin",
        client,
      );
    }

    const chain = client.chain;
    if (!chain) {
      throw new ChainNotFoundError();
    }

    const dependencies = params.dependencyOverrides ?? [
      (() => {
        const pluginAddress = MultiOwnerPlugin.meta.addresses[chain.id];
        if (!pluginAddress) {
          throw new Error(
            "missing MultiOwnerPlugin address for chain " + chain.name,
          );
        }

        return encodePacked(["address", "uint8"], [pluginAddress, 0x0]);
      })(),

      (() => {
        const pluginAddress = MultiOwnerPlugin.meta.addresses[chain.id];
        if (!pluginAddress) {
          throw new Error(
            "missing MultiOwnerPlugin address for chain " + chain.name,
          );
        }

        return encodePacked(["address", "uint8"], [pluginAddress, 0x1]);
      })(),
    ];
    const pluginAddress =
      params.pluginAddress ??
      (SessionKeyPlugin.meta.addresses[chain.id] as Address | undefined);

    if (!pluginAddress) {
      throw new Error(
        "missing SessionKeyPlugin address for chain " + chain.name,
      );
    }

    return installPlugin_(client, {
      pluginAddress,
      pluginInitData: encodeAbiParameters(
        [
          { type: "address[]", name: "initialKeys" },
          { type: "bytes32[]", name: "tags" },
          { type: "bytes[][]", name: "initialPermissions" },
        ],
        params.args,
      ),
      dependencies,
      overrides,
      account,
      context,
    });
  },
  encodeExecuteWithSessionKey({ args }) {
    return encodeFunctionData({
      abi: SessionKeyPluginExecutionFunctionAbi,
      functionName: "executeWithSessionKey",
      args,
    });
  },
  encodeAddSessionKey({ args }) {
    return encodeFunctionData({
      abi: SessionKeyPluginExecutionFunctionAbi,
      functionName: "addSessionKey",
      args,
    });
  },
  encodeRemoveSessionKey({ args }) {
    return encodeFunctionData({
      abi: SessionKeyPluginExecutionFunctionAbi,
      functionName: "removeSessionKey",
      args,
    });
  },
  encodeRotateSessionKey({ args }) {
    return encodeFunctionData({
      abi: SessionKeyPluginExecutionFunctionAbi,
      functionName: "rotateSessionKey",
      args,
    });
  },
  encodeUpdateKeyPermissions({ args }) {
    return encodeFunctionData({
      abi: SessionKeyPluginExecutionFunctionAbi,
      functionName: "updateKeyPermissions",
      args,
    });
  },
});

export const SessionKeyPluginExecutionFunctionAbi = [
  {
    type: "function",
    name: "executeWithSessionKey",
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        internalType: "struct Call[]",
        components: [
          { name: "target", type: "address", internalType: "address" },
          { name: "value", type: "uint256", internalType: "uint256" },
          { name: "data", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "sessionKey", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bytes[]", internalType: "bytes[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addSessionKey",
    inputs: [
      { name: "sessionKey", type: "address", internalType: "address" },
      { name: "tag", type: "bytes32", internalType: "bytes32" },
      { name: "permissionUpdates", type: "bytes[]", internalType: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeSessionKey",
    inputs: [
      { name: "sessionKey", type: "address", internalType: "address" },
      { name: "predecessor", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rotateSessionKey",
    inputs: [
      { name: "oldSessionKey", type: "address", internalType: "address" },
      { name: "predecessor", type: "bytes32", internalType: "bytes32" },
      { name: "newSessionKey", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateKeyPermissions",
    inputs: [
      { name: "sessionKey", type: "address", internalType: "address" },
      { name: "updates", type: "bytes[]", internalType: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const SessionKeyPluginAbi = [
  {
    type: "function",
    name: "addSessionKey",
    inputs: [
      { name: "sessionKey", type: "address", internalType: "address" },
      { name: "tag", type: "bytes32", internalType: "bytes32" },
      { name: "permissionUpdates", type: "bytes[]", internalType: "bytes[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "executeWithSessionKey",
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        internalType: "struct Call[]",
        components: [
          { name: "target", type: "address", internalType: "address" },
          { name: "value", type: "uint256", internalType: "uint256" },
          { name: "data", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "sessionKey", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bytes[]", internalType: "bytes[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "findPredecessor",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAccessControlEntry",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
      { name: "contractAddress", type: "address", internalType: "address" },
    ],
    outputs: [
      { name: "isOnList", type: "bool", internalType: "bool" },
      { name: "checkSelectors", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAccessControlType",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum ISessionKeyPlugin.ContractAccessControlType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getERC20SpendLimitInfo",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct ISessionKeyPlugin.SpendLimitInfo",
        components: [
          { name: "hasLimit", type: "bool", internalType: "bool" },
          { name: "limit", type: "uint256", internalType: "uint256" },
          { name: "limitUsed", type: "uint256", internalType: "uint256" },
          { name: "refreshInterval", type: "uint48", internalType: "uint48" },
          { name: "lastUsedTime", type: "uint48", internalType: "uint48" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getGasSpendLimit",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "info",
        type: "tuple",
        internalType: "struct ISessionKeyPlugin.SpendLimitInfo",
        components: [
          { name: "hasLimit", type: "bool", internalType: "bool" },
          { name: "limit", type: "uint256", internalType: "uint256" },
          { name: "limitUsed", type: "uint256", internalType: "uint256" },
          { name: "refreshInterval", type: "uint48", internalType: "uint48" },
          { name: "lastUsedTime", type: "uint48", internalType: "uint48" },
        ],
      },
      { name: "shouldReset", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getKeyTimeRange",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
    ],
    outputs: [
      { name: "validAfter", type: "uint48", internalType: "uint48" },
      { name: "validUntil", type: "uint48", internalType: "uint48" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getNativeTokenSpendLimitInfo",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "info",
        type: "tuple",
        internalType: "struct ISessionKeyPlugin.SpendLimitInfo",
        components: [
          { name: "hasLimit", type: "bool", internalType: "bool" },
          { name: "limit", type: "uint256", internalType: "uint256" },
          { name: "limitUsed", type: "uint256", internalType: "uint256" },
          { name: "refreshInterval", type: "uint48", internalType: "uint48" },
          { name: "lastUsedTime", type: "uint48", internalType: "uint48" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRequiredPaymaster",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isSelectorOnAccessControlList",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
      { name: "contractAddress", type: "address", internalType: "address" },
      { name: "selector", type: "bytes4", internalType: "bytes4" },
    ],
    outputs: [{ name: "isOnList", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isSessionKeyOf",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
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
    name: "removeSessionKey",
    inputs: [
      { name: "sessionKey", type: "address", internalType: "address" },
      { name: "predecessor", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resetSessionKeyGasLimitTimestamp",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rotateSessionKey",
    inputs: [
      { name: "oldSessionKey", type: "address", internalType: "address" },
      { name: "predecessor", type: "bytes32", internalType: "bytes32" },
      { name: "newSessionKey", type: "address", internalType: "address" },
    ],
    outputs: [],
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
    name: "sessionKeysOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
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
    name: "updateKeyPermissions",
    inputs: [
      { name: "sessionKey", type: "address", internalType: "address" },
      { name: "updates", type: "bytes[]", internalType: "bytes[]" },
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
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "PermissionsUpdated",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sessionKey",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "updates",
        type: "bytes[]",
        indexed: false,
        internalType: "bytes[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SessionKeyAdded",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sessionKey",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "tag", type: "bytes32", indexed: true, internalType: "bytes32" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SessionKeyRemoved",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sessionKey",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SessionKeyRotated",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "oldSessionKey",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newSessionKey",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "AlreadyInitialized", inputs: [] },
  {
    type: "error",
    name: "ERC20SpendLimitExceeded",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
    ],
  },
  { type: "error", name: "InvalidAction", inputs: [] },
  {
    type: "error",
    name: "InvalidPermissionsUpdate",
    inputs: [
      { name: "updateSelector", type: "bytes4", internalType: "bytes4" },
    ],
  },
  {
    type: "error",
    name: "InvalidSessionKey",
    inputs: [{ name: "sessionKey", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "InvalidSignature",
    inputs: [{ name: "sessionKey", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "InvalidToken",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
  { type: "error", name: "LengthMismatch", inputs: [] },
  {
    type: "error",
    name: "NativeTokenSpendLimitExceeded",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "sessionKey", type: "address", internalType: "address" },
    ],
  },
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
    name: "SessionKeyNotFound",
    inputs: [{ name: "sessionKey", type: "address", internalType: "address" }],
  },
] as const;
