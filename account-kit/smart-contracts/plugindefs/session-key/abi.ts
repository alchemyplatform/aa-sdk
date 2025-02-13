export const SessionKeyPluginAbi = [
  {
    type: "function",
    name: "addSessionKey",
    inputs: [
      { name: "sessionKey", type: "address", internalType: "address" },
      { name: "tag", type: "bytes32", internalType: "bytes32" },
      {
        name: "permissionUpdates",
        type: "bytes[]",
        internalType: "bytes[]",
      },
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
      {
        name: "contractAddress",
        type: "address",
        internalType: "address",
      },
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
          {
            name: "limitUsed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "refreshInterval",
            type: "uint48",
            internalType: "uint48",
          },
          {
            name: "lastUsedTime",
            type: "uint48",
            internalType: "uint48",
          },
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
          {
            name: "limitUsed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "refreshInterval",
            type: "uint48",
            internalType: "uint48",
          },
          {
            name: "lastUsedTime",
            type: "uint48",
            internalType: "uint48",
          },
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
          {
            name: "limitUsed",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "refreshInterval",
            type: "uint48",
            internalType: "uint48",
          },
          {
            name: "lastUsedTime",
            type: "uint48",
            internalType: "uint48",
          },
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
      {
        name: "contractAddress",
        type: "address",
        internalType: "address",
      },
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
          {
            name: "interfaceIds",
            type: "bytes4[]",
            internalType: "bytes4[]",
          },
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
          {
            name: "canSpendNativeToken",
            type: "bool",
            internalType: "bool",
          },
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
              {
                name: "permitAnySelector",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "selectors",
                type: "bytes4[]",
                internalType: "bytes4[]",
              },
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
                  {
                    name: "functionId",
                    type: "uint8",
                    internalType: "uint8",
                  },
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
                  {
                    name: "functionId",
                    type: "uint8",
                    internalType: "uint8",
                  },
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
                  {
                    name: "functionId",
                    type: "uint8",
                    internalType: "uint8",
                  },
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
                  {
                    name: "functionId",
                    type: "uint8",
                    internalType: "uint8",
                  },
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
                  {
                    name: "functionId",
                    type: "uint8",
                    internalType: "uint8",
                  },
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
                  {
                    name: "functionId",
                    type: "uint8",
                    internalType: "uint8",
                  },
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
      {
        name: "oldSessionKey",
        type: "address",
        internalType: "address",
      },
      { name: "predecessor", type: "bytes32", internalType: "bytes32" },
      {
        name: "newSessionKey",
        type: "address",
        internalType: "address",
      },
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
      {
        name: "tag",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
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
