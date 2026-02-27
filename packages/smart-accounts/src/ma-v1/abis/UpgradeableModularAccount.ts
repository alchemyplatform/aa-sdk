export const UpgradeableModularAccountAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "anEntryPoint",
        type: "address",
        internalType: "contract IEntryPoint",
      },
    ],
    stateMutability: "nonpayable",
  },
  { type: "fallback", stateMutability: "payable" },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    name: "entryPoint",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IEntryPoint",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "execute",
    inputs: [
      { name: "target", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "result", type: "bytes", internalType: "bytes" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "executeBatch",
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
    ],
    outputs: [{ name: "results", type: "bytes[]", internalType: "bytes[]" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "executeFromPlugin",
    inputs: [{ name: "data", type: "bytes", internalType: "bytes" }],
    outputs: [{ name: "returnData", type: "bytes", internalType: "bytes" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "executeFromPluginExternal",
    inputs: [
      { name: "target", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getExecutionFunctionConfig",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    outputs: [
      {
        name: "config",
        type: "tuple",
        internalType: "struct IAccountLoupe.ExecutionFunctionConfig",
        components: [
          { name: "plugin", type: "address", internalType: "address" },
          {
            name: "userOpValidationFunction",
            type: "bytes21",
            internalType: "FunctionReference",
          },
          {
            name: "runtimeValidationFunction",
            type: "bytes21",
            internalType: "FunctionReference",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getExecutionHooks",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    outputs: [
      {
        name: "execHooks",
        type: "tuple[]",
        internalType: "struct IAccountLoupe.ExecutionHooks[]",
        components: [
          {
            name: "preExecHook",
            type: "bytes21",
            internalType: "FunctionReference",
          },
          {
            name: "postExecHook",
            type: "bytes21",
            internalType: "FunctionReference",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getInstalledPlugins",
    inputs: [],
    outputs: [
      {
        name: "pluginAddresses",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getNonce",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPreValidationHooks",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    outputs: [
      {
        name: "preUserOpValidationHooks",
        type: "bytes21[]",
        internalType: "FunctionReference[]",
      },
      {
        name: "preRuntimeValidationHooks",
        type: "bytes21[]",
        internalType: "FunctionReference[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      { name: "plugins", type: "address[]", internalType: "address[]" },
      { name: "pluginInitData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "installPlugin",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      {
        name: "manifestHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "pluginInstallData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "dependencies",
        type: "bytes21[]",
        internalType: "FunctionReference[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onERC1155BatchReceived",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "from", type: "address", internalType: "address" },
      { name: "ids", type: "uint256[]", internalType: "uint256[]" },
      { name: "values", type: "uint256[]", internalType: "uint256[]" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onERC1155Received",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "from", type: "address", internalType: "address" },
      { name: "id", type: "uint256", internalType: "uint256" },
      { name: "value", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onERC721Received",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "from", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "proxiableUUID",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
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
    name: "tokensReceived",
    inputs: [
      { name: "operator", type: "address", internalType: "address" },
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "userData", type: "bytes", internalType: "bytes" },
      { name: "operatorData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "uninstallPlugin",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "config", type: "bytes", internalType: "bytes" },
      {
        name: "pluginUninstallData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    inputs: [
      {
        name: "newImplementation",
        type: "address",
        internalType: "address",
      },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "validateUserOp",
    inputs: [
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct UserOperation",
        components: [
          { name: "sender", type: "address", internalType: "address" },
          { name: "nonce", type: "uint256", internalType: "uint256" },
          { name: "initCode", type: "bytes", internalType: "bytes" },
          { name: "callData", type: "bytes", internalType: "bytes" },
          {
            name: "callGasLimit",
            type: "uint256",
            internalType: "uint256",
          },
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
          {
            name: "maxFeePerGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxPriorityFeePerGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          { name: "signature", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "userOpHash", type: "bytes32", internalType: "bytes32" },
      {
        name: "missingAccountFunds",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "validationData",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ModularAccountInitialized",
    inputs: [
      {
        name: "entryPoint",
        type: "address",
        indexed: true,
        internalType: "contract IEntryPoint",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PluginInstalled",
    inputs: [
      {
        name: "plugin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "manifestHash",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "dependencies",
        type: "bytes21[]",
        indexed: false,
        internalType: "FunctionReference[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PluginUninstalled",
    inputs: [
      {
        name: "plugin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "onUninstallSucceeded",
        type: "bool",
        indexed: true,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Upgraded",
    inputs: [
      {
        name: "implementation",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "AlreadyInitialized", inputs: [] },
  { type: "error", name: "AlreadyInitializing", inputs: [] },
  { type: "error", name: "AlwaysDenyRule", inputs: [] },
  { type: "error", name: "ArrayLengthMismatch", inputs: [] },
  {
    type: "error",
    name: "DuplicateHookLimitExceeded",
    inputs: [
      { name: "selector", type: "bytes4", internalType: "bytes4" },
      {
        name: "hook",
        type: "bytes21",
        internalType: "FunctionReference",
      },
    ],
  },
  {
    type: "error",
    name: "DuplicatePreRuntimeValidationHookLimitExceeded",
    inputs: [
      { name: "selector", type: "bytes4", internalType: "bytes4" },
      {
        name: "hook",
        type: "bytes21",
        internalType: "FunctionReference",
      },
    ],
  },
  {
    type: "error",
    name: "DuplicatePreUserOpValidationHookLimitExceeded",
    inputs: [
      { name: "selector", type: "bytes4", internalType: "bytes4" },
      {
        name: "hook",
        type: "bytes21",
        internalType: "FunctionReference",
      },
    ],
  },
  {
    type: "error",
    name: "Erc4337FunctionNotAllowed",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
  },
  {
    type: "error",
    name: "ExecFromPluginExternalNotPermitted",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "target", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
  },
  {
    type: "error",
    name: "ExecFromPluginNotPermitted",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "selector", type: "bytes4", internalType: "bytes4" },
    ],
  },
  {
    type: "error",
    name: "ExecutionFunctionAlreadySet",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
  },
  {
    type: "error",
    name: "IPluginFunctionNotAllowed",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
  },
  { type: "error", name: "InterfaceNotAllowed", inputs: [] },
  { type: "error", name: "InvalidDependenciesProvided", inputs: [] },
  { type: "error", name: "InvalidPluginManifest", inputs: [] },
  {
    type: "error",
    name: "MissingPluginDependency",
    inputs: [{ name: "dependency", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "NativeFunctionNotAllowed",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
  },
  {
    type: "error",
    name: "NativeTokenSpendingNotPermitted",
    inputs: [{ name: "plugin", type: "address", internalType: "address" }],
  },
  { type: "error", name: "NullFunctionReference", inputs: [] },
  {
    type: "error",
    name: "PluginAlreadyInstalled",
    inputs: [{ name: "plugin", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "PluginCallDenied",
    inputs: [{ name: "plugin", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "PluginDependencyViolation",
    inputs: [{ name: "plugin", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "PluginInstallCallbackFailed",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "revertReason", type: "bytes", internalType: "bytes" },
    ],
  },
  {
    type: "error",
    name: "PluginInterfaceNotSupported",
    inputs: [{ name: "plugin", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "PluginNotInstalled",
    inputs: [{ name: "plugin", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "PluginUninstallCallbackFailed",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "revertReason", type: "bytes", internalType: "bytes" },
    ],
  },
  {
    type: "error",
    name: "PostExecHookReverted",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "functionId", type: "uint8", internalType: "uint8" },
      { name: "revertReason", type: "bytes", internalType: "bytes" },
    ],
  },
  {
    type: "error",
    name: "PreExecHookReverted",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "functionId", type: "uint8", internalType: "uint8" },
      { name: "revertReason", type: "bytes", internalType: "bytes" },
    ],
  },
  {
    type: "error",
    name: "PreRuntimeValidationHookFailed",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "functionId", type: "uint8", internalType: "uint8" },
      { name: "revertReason", type: "bytes", internalType: "bytes" },
    ],
  },
  {
    type: "error",
    name: "RuntimeValidationFunctionAlreadySet",
    inputs: [
      { name: "selector", type: "bytes4", internalType: "bytes4" },
      {
        name: "validationFunction",
        type: "bytes21",
        internalType: "FunctionReference",
      },
    ],
  },
  {
    type: "error",
    name: "RuntimeValidationFunctionMissing",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
  },
  {
    type: "error",
    name: "RuntimeValidationFunctionReverted",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "functionId", type: "uint8", internalType: "uint8" },
      { name: "revertReason", type: "bytes", internalType: "bytes" },
    ],
  },
  { type: "error", name: "UnauthorizedCallContext", inputs: [] },
  {
    type: "error",
    name: "UnexpectedAggregator",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "functionId", type: "uint8", internalType: "uint8" },
      { name: "aggregator", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error",
    name: "UnrecognizedFunction",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
  },
  { type: "error", name: "UpgradeFailed", inputs: [] },
  { type: "error", name: "UserOpNotFromEntryPoint", inputs: [] },
  {
    type: "error",
    name: "UserOpValidationFunctionAlreadySet",
    inputs: [
      { name: "selector", type: "bytes4", internalType: "bytes4" },
      {
        name: "validationFunction",
        type: "bytes21",
        internalType: "FunctionReference",
      },
    ],
  },
  {
    type: "error",
    name: "UserOpValidationFunctionMissing",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
  },
] as const;
