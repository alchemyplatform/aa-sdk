export const UpgradeableModularAccountAbi = [
  {
    inputs: [
      {
        internalType: "contract IEntryPoint",
        name: "anEntryPoint",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AlreadyInitialized",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyInitializing",
    type: "error",
  },
  {
    inputs: [],
    name: "AlwaysDenyRule",
    type: "error",
  },
  {
    inputs: [],
    name: "ArrayLengthMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "revertReason",
        type: "bytes",
      },
    ],
    name: "AuthorizeUpgradeReverted",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
      {
        internalType: "FunctionReference",
        name: "hook",
        type: "bytes21",
      },
    ],
    name: "DuplicateHookLimitExceeded",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
      {
        internalType: "FunctionReference",
        name: "hook",
        type: "bytes21",
      },
    ],
    name: "DuplicatePreRuntimeValidationHookLimitExceeded",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
      {
        internalType: "FunctionReference",
        name: "hook",
        type: "bytes21",
      },
    ],
    name: "DuplicatePreUserOpValidationHookLimitExceeded",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "Erc4337FunctionNotAllowed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "ExecFromPluginExternalNotPermitted",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "ExecFromPluginNotPermitted",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "ExecutionFunctionAlreadySet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "ExecutionFunctionNotSet",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidDependenciesProvided",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPluginManifest",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "dependency",
        type: "address",
      },
    ],
    name: "MissingPluginDependency",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "NativeFunctionNotAllowed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
    ],
    name: "NativeTokenSpendingNotPermitted",
    type: "error",
  },
  {
    inputs: [],
    name: "NullFunctionReference",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
    ],
    name: "PluginAlreadyInstalled",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "providingPlugin",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "revertReason",
        type: "bytes",
      },
    ],
    name: "PluginApplyHookCallbackFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
    ],
    name: "PluginCallDenied",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
    ],
    name: "PluginDependencyViolation",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "providingPlugin",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "revertReason",
        type: "bytes",
      },
    ],
    name: "PluginHookUnapplyCallbackFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "revertReason",
        type: "bytes",
      },
    ],
    name: "PluginInstallCallbackFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
    ],
    name: "PluginInterfaceNotSupported",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
    ],
    name: "PluginNotInstalled",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "revertReason",
        type: "bytes",
      },
    ],
    name: "PluginUninstallCallbackFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "functionId",
        type: "uint8",
      },
      {
        internalType: "bytes",
        name: "revertReason",
        type: "bytes",
      },
    ],
    name: "PostExecHookReverted",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "functionId",
        type: "uint8",
      },
      {
        internalType: "bytes",
        name: "revertReason",
        type: "bytes",
      },
    ],
    name: "PreExecHookReverted",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "functionId",
        type: "uint8",
      },
      {
        internalType: "bytes",
        name: "revertReason",
        type: "bytes",
      },
    ],
    name: "PreRuntimeValidationHookFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
      {
        internalType: "FunctionReference",
        name: "validationFunction",
        type: "bytes21",
      },
    ],
    name: "RuntimeValidationFunctionAlreadySet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "RuntimeValidationFunctionMissing",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "functionId",
        type: "uint8",
      },
      {
        internalType: "bytes",
        name: "revertReason",
        type: "bytes",
      },
    ],
    name: "RuntimeValidationFunctionReverted",
    type: "error",
  },
  {
    inputs: [],
    name: "UnauthorizedCallContext",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "functionId",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "aggregator",
        type: "address",
      },
    ],
    name: "UnexpectedAggregator",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "UnrecognizedFunction",
    type: "error",
  },
  {
    inputs: [],
    name: "UpgradeFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "UserOpNotFromEntryPoint",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
      {
        internalType: "FunctionReference",
        name: "validationFunction",
        type: "bytes21",
      },
    ],
    name: "UserOpValidationFunctionAlreadySet",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "UserOpValidationFunctionMissing",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract IEntryPoint",
        name: "entryPoint",
        type: "address",
      },
    ],
    name: "ModularAccountInitialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "providingPlugin",
        type: "address",
      },
    ],
    name: "PluginIgnoredHookUnapplyCallbackFailure",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "plugin",
        type: "address",
      },
    ],
    name: "PluginIgnoredUninstallCallbackFailure",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "manifestHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "FunctionReference[]",
        name: "dependencies",
        type: "bytes21[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "providingPlugin",
            type: "address",
          },
          {
            internalType: "bytes4",
            name: "selector",
            type: "bytes4",
          },
          {
            components: [
              {
                internalType: "uint8",
                name: "preExecHookFunctionId",
                type: "uint8",
              },
              {
                internalType: "bool",
                name: "isPostHookUsed",
                type: "bool",
              },
              {
                internalType: "uint8",
                name: "postExecHookFunctionId",
                type: "uint8",
              },
            ],
            internalType: "struct IPluginManager.InjectedHooksInfo",
            name: "injectedHooksInfo",
            type: "tuple",
          },
          {
            internalType: "bytes",
            name: "hookApplyData",
            type: "bytes",
          },
        ],
        indexed: false,
        internalType: "struct IPluginManager.InjectedHook[]",
        name: "injectedHooks",
        type: "tuple[]",
      },
    ],
    name: "PluginInstalled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bool",
        name: "callbacksSucceeded",
        type: "bool",
      },
    ],
    name: "PluginUninstalled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "entryPoint",
    outputs: [
      {
        internalType: "contract IEntryPoint",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "execute",
    outputs: [
      {
        internalType: "bytes",
        name: "result",
        type: "bytes",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "executeBatch",
    outputs: [
      {
        internalType: "bytes[]",
        name: "results",
        type: "bytes[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "executeFromPlugin",
    outputs: [
      {
        internalType: "bytes",
        name: "returnData",
        type: "bytes",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "executeFromPluginExternal",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "getExecutionFunctionConfig",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "plugin",
            type: "address",
          },
          {
            internalType: "FunctionReference",
            name: "userOpValidationFunction",
            type: "bytes21",
          },
          {
            internalType: "FunctionReference",
            name: "runtimeValidationFunction",
            type: "bytes21",
          },
        ],
        internalType: "struct IAccountLoupe.ExecutionFunctionConfig",
        name: "config",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "getExecutionHooks",
    outputs: [
      {
        components: [
          {
            internalType: "FunctionReference",
            name: "preExecHook",
            type: "bytes21",
          },
          {
            internalType: "FunctionReference",
            name: "postExecHook",
            type: "bytes21",
          },
        ],
        internalType: "struct IAccountLoupe.ExecutionHooks[]",
        name: "execHooks",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getInstalledPlugins",
    outputs: [
      {
        internalType: "address[]",
        name: "pluginAddresses",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "callingPlugin",
        type: "address",
      },
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "getPermittedCallHooks",
    outputs: [
      {
        components: [
          {
            internalType: "FunctionReference",
            name: "preExecHook",
            type: "bytes21",
          },
          {
            internalType: "FunctionReference",
            name: "postExecHook",
            type: "bytes21",
          },
        ],
        internalType: "struct IAccountLoupe.ExecutionHooks[]",
        name: "execHooks",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "getPreValidationHooks",
    outputs: [
      {
        internalType: "FunctionReference[]",
        name: "preUserOpValidationHooks",
        type: "bytes21[]",
      },
      {
        internalType: "FunctionReference[]",
        name: "preRuntimeValidationHooks",
        type: "bytes21[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "plugins",
        type: "address[]",
      },
      {
        internalType: "bytes",
        name: "pluginInitData",
        type: "bytes",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "manifestHash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "pluginInitData",
        type: "bytes",
      },
      {
        internalType: "FunctionReference[]",
        name: "dependencies",
        type: "bytes21[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "providingPlugin",
            type: "address",
          },
          {
            internalType: "bytes4",
            name: "selector",
            type: "bytes4",
          },
          {
            components: [
              {
                internalType: "uint8",
                name: "preExecHookFunctionId",
                type: "uint8",
              },
              {
                internalType: "bool",
                name: "isPostHookUsed",
                type: "bool",
              },
              {
                internalType: "uint8",
                name: "postExecHookFunctionId",
                type: "uint8",
              },
            ],
            internalType: "struct IPluginManager.InjectedHooksInfo",
            name: "injectedHooksInfo",
            type: "tuple",
          },
          {
            internalType: "bytes",
            name: "hookApplyData",
            type: "bytes",
          },
        ],
        internalType: "struct IPluginManager.InjectedHook[]",
        name: "injectedHooks",
        type: "tuple[]",
      },
    ],
    name: "installPlugin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "proxiableUUID",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "config",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "pluginUninstallData",
        type: "bytes",
      },
      {
        internalType: "bytes[]",
        name: "hookUnapplyData",
        type: "bytes[]",
      },
    ],
    name: "uninstallPlugin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "initCode",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "callGasLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "verificationGasLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "preVerificationGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxFeePerGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxPriorityFeePerGas",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "paymasterAndData",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct UserOperation",
        name: "userOp",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "userOpHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "missingAccountFunds",
        type: "uint256",
      },
    ],
    name: "validateUserOp",
    outputs: [
      {
        internalType: "uint256",
        name: "validationData",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;
