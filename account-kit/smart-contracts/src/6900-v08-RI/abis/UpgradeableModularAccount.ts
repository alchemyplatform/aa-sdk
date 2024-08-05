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
  {
    type: "fallback",
    stateMutability: "payable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
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
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "result",
        type: "bytes",
        internalType: "bytes",
      },
    ],
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
          {
            name: "target",
            type: "address",
            internalType: "address",
          },
          {
            name: "value",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "results",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "executeUserOp",
    inputs: [
      {
        name: "userOp",
        type: "tuple",
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "executeWithAuthorization",
    inputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "authorization",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getExecutionData",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    outputs: [
      {
        name: "data",
        type: "tuple",
        internalType: "struct ExecutionDataView",
        components: [
          {
            name: "module",
            type: "address",
            internalType: "address",
          },
          {
            name: "isPublic",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "allowGlobalValidation",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "executionHooks",
            type: "bytes26[]",
            internalType: "HookConfig[]",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getNonce",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getValidationData",
    inputs: [
      {
        name: "validationFunction",
        type: "bytes24",
        internalType: "ModuleEntity",
      },
    ],
    outputs: [
      {
        name: "data",
        type: "tuple",
        internalType: "struct ValidationDataView",
        components: [
          {
            name: "isGlobal",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "isSignatureValidation",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "preValidationHooks",
            type: "bytes24[]",
            internalType: "ModuleEntity[]",
          },
          {
            name: "permissionHooks",
            type: "bytes26[]",
            internalType: "HookConfig[]",
          },
          {
            name: "selectors",
            type: "bytes4[]",
            internalType: "bytes4[]",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initializeWithValidation",
    inputs: [
      {
        name: "validationConfig",
        type: "bytes26",
        internalType: "ValidationConfig",
      },
      {
        name: "selectors",
        type: "bytes4[]",
        internalType: "bytes4[]",
      },
      {
        name: "installData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "hooks",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "installExecution",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "manifest",
        type: "tuple",
        internalType: "struct ExecutionManifest",
        components: [
          {
            name: "executionFunctions",
            type: "tuple[]",
            internalType: "struct ManifestExecutionFunction[]",
            components: [
              {
                name: "executionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "isPublic",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "allowGlobalValidation",
                type: "bool",
                internalType: "bool",
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
                name: "entityId",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "isPreHook",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "isPostHook",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
          {
            name: "interfaceIds",
            type: "bytes4[]",
            internalType: "bytes4[]",
          },
        ],
      },
      {
        name: "moduleInstallData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "installValidation",
    inputs: [
      {
        name: "validationConfig",
        type: "bytes26",
        internalType: "ValidationConfig",
      },
      {
        name: "selectors",
        type: "bytes4[]",
        internalType: "bytes4[]",
      },
      {
        name: "installData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "hooks",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isValidSignature",
    inputs: [
      {
        name: "hash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "proxiableUUID",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "uninstallExecution",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "manifest",
        type: "tuple",
        internalType: "struct ExecutionManifest",
        components: [
          {
            name: "executionFunctions",
            type: "tuple[]",
            internalType: "struct ManifestExecutionFunction[]",
            components: [
              {
                name: "executionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "isPublic",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "allowGlobalValidation",
                type: "bool",
                internalType: "bool",
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
                name: "entityId",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "isPreHook",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "isPostHook",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
          {
            name: "interfaceIds",
            type: "bytes4[]",
            internalType: "bytes4[]",
          },
        ],
      },
      {
        name: "moduleUninstallData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "uninstallValidation",
    inputs: [
      {
        name: "validationFunction",
        type: "bytes24",
        internalType: "ModuleEntity",
      },
      {
        name: "uninstallData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "hookUninstallData",
        type: "bytes[]",
        internalType: "bytes[]",
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
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
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
        internalType: "struct PackedUserOperation",
        components: [
          {
            name: "sender",
            type: "address",
            internalType: "address",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "initCode",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "callData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "accountGasLimits",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "preVerificationGas",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasFees",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "paymasterAndData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "signature",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
      {
        name: "userOpHash",
        type: "bytes32",
        internalType: "bytes32",
      },
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
    name: "ExecutionInstalled",
    inputs: [
      {
        name: "module",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "manifest",
        type: "tuple",
        indexed: false,
        internalType: "struct ExecutionManifest",
        components: [
          {
            name: "executionFunctions",
            type: "tuple[]",
            internalType: "struct ManifestExecutionFunction[]",
            components: [
              {
                name: "executionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "isPublic",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "allowGlobalValidation",
                type: "bool",
                internalType: "bool",
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
                name: "entityId",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "isPreHook",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "isPostHook",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
          {
            name: "interfaceIds",
            type: "bytes4[]",
            internalType: "bytes4[]",
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ExecutionUninstalled",
    inputs: [
      {
        name: "module",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "onUninstallSucceeded",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
      {
        name: "manifest",
        type: "tuple",
        indexed: false,
        internalType: "struct ExecutionManifest",
        components: [
          {
            name: "executionFunctions",
            type: "tuple[]",
            internalType: "struct ManifestExecutionFunction[]",
            components: [
              {
                name: "executionSelector",
                type: "bytes4",
                internalType: "bytes4",
              },
              {
                name: "isPublic",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "allowGlobalValidation",
                type: "bool",
                internalType: "bool",
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
                name: "entityId",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "isPreHook",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "isPostHook",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
          {
            name: "interfaceIds",
            type: "bytes4[]",
            internalType: "bytes4[]",
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
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
  {
    type: "event",
    name: "ValidationInstalled",
    inputs: [
      {
        name: "module",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "entityId",
        type: "uint32",
        indexed: true,
        internalType: "uint32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ValidationUninstalled",
    inputs: [
      {
        name: "module",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "entityId",
        type: "uint32",
        indexed: true,
        internalType: "uint32",
      },
      {
        name: "onUninstallSucceeded",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ArrayLengthMismatch",
    inputs: [],
  },
  {
    type: "error",
    name: "AuthorizeUpgradeReverted",
    inputs: [
      {
        name: "revertReason",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        name: "implementation",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC1967NonPayable",
    inputs: [],
  },
  {
    type: "error",
    name: "Erc4337FunctionNotAllowed",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "ExecFromModuleExternalNotPermitted",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "ExecFromModuleNotPermitted",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "ExecutionFunctionAlreadySet",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "FailedInnerCall",
    inputs: [],
  },
  {
    type: "error",
    name: "IModuleFunctionNotAllowed",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: [],
  },
  {
    type: "error",
    name: "ModuleInstallCallbackFailed",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "revertReason",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "ModuleInterfaceNotSupported",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ModuleNotInstalled",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "NativeFunctionNotAllowed",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "NativeTokenSpendingNotPermitted",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "NonCanonicalEncoding",
    inputs: [],
  },
  {
    type: "error",
    name: "NotEntryPoint",
    inputs: [],
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: [],
  },
  {
    type: "error",
    name: "NullModule",
    inputs: [],
  },
  {
    type: "error",
    name: "PermissionAlreadySet",
    inputs: [
      {
        name: "validationFunction",
        type: "bytes24",
        internalType: "ModuleEntity",
      },
      {
        name: "hookConfig",
        type: "bytes26",
        internalType: "HookConfig",
      },
    ],
  },
  {
    type: "error",
    name: "PostExecHookReverted",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "revertReason",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "PreExecHookReverted",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "revertReason",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "PreRuntimeValidationHookFailed",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "revertReason",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "PreValidationHookLimitExceeded",
    inputs: [],
  },
  {
    type: "error",
    name: "RequireUserOperationContext",
    inputs: [],
  },
  {
    type: "error",
    name: "RuntimeValidationFunctionMissing",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "RuntimeValidationFunctionReverted",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "revertReason",
        type: "bytes",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "error",
    name: "SelfCallRecursionDepthExceeded",
    inputs: [],
  },
  {
    type: "error",
    name: "SignatureSegmentOutOfOrder",
    inputs: [],
  },
  {
    type: "error",
    name: "SignatureValidationInvalid",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
    ],
  },
  {
    type: "error",
    name: "UUPSUnauthorizedCallContext",
    inputs: [],
  },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [
      {
        name: "slot",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "error",
    name: "UnexpectedAggregator",
    inputs: [
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "aggregator",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "UnrecognizedFunction",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "ValidationAlreadySet",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
      {
        name: "validationFunction",
        type: "bytes24",
        internalType: "ModuleEntity",
      },
    ],
  },
  {
    type: "error",
    name: "ValidationDoesNotApply",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
      {
        name: "module",
        type: "address",
        internalType: "address",
      },
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "isGlobal",
        type: "bool",
        internalType: "bool",
      },
    ],
  },
  {
    type: "error",
    name: "ValidationFunctionMissing",
    inputs: [
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
  },
  {
    type: "error",
    name: "ValidationSignatureSegmentMissing",
    inputs: [],
  },
] as const;
