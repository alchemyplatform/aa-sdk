export const MultiOwnerPluginAbi = [
  {
    type: "function",
    name: "eip712Domain",
    inputs: [],
    outputs: [
      { name: "fields", type: "bytes1", internalType: "bytes1" },
      { name: "name", type: "string", internalType: "string" },
      { name: "version", type: "string", internalType: "string" },
      { name: "chainId", type: "uint256", internalType: "uint256" },
      {
        name: "verifyingContract",
        type: "address",
        internalType: "address",
      },
      { name: "salt", type: "bytes32", internalType: "bytes32" },
      {
        name: "extensions",
        type: "uint256[]",
        internalType: "uint256[]",
      },
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
    name: "ownersOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
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
    name: "runtimeValidationFunction",
    inputs: [
      { name: "functionId", type: "uint8", internalType: "uint8" },
      { name: "sender", type: "address", internalType: "address" },
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
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
    name: "updateOwners",
    inputs: [
      {
        name: "ownersToAdd",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "ownersToRemove",
        type: "address[]",
        internalType: "address[]",
      },
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
    ],
    anonymous: false,
  },
  { type: "error", name: "AlreadyInitialized", inputs: [] },
  { type: "error", name: "EmptyOwnersNotAllowed", inputs: [] },
  { type: "error", name: "InvalidAction", inputs: [] },
  {
    type: "error",
    name: "InvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  { type: "error", name: "NotAuthorized", inputs: [] },
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
