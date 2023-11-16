export const MultiOwnerPluginAbi = [
  {
    inputs: [],
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
    name: "EmptyOwnersNotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAction",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidShortString",
    type: "error",
  },
  {
    inputs: [],
    name: "NotAuthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "NotContractCaller",
    type: "error",
  },
  {
    inputs: [],
    name: "NotImplemented",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInitialized",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnerAlreadyExists",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnerDoesNotExist",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "str",
        type: "string",
      },
    ],
    name: "StringTooLong",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [],
    name: "EIP712DomainChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "addedOwners",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "removedOwners",
        type: "address[]",
      },
    ],
    name: "OwnerUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      {
        internalType: "bytes1",
        name: "fields",
        type: "bytes1",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "version",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "verifyingContract",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        internalType: "uint256[]",
        name: "extensions",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
    ],
    name: "encodeMessageData",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
    ],
    name: "getMessageHash",
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
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "address",
        name: "ownerToCheck",
        type: "address",
      },
    ],
    name: "isOwnerOf",
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
        internalType: "bytes32",
        name: "digest",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "isValidSignature",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pluginAppliedOn",
        type: "address",
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
        name: "data",
        type: "bytes",
      },
    ],
    name: "onHookApply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pluginAppliedOn",
        type: "address",
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
        name: "data",
        type: "bytes",
      },
    ],
    name: "onHookUnapply",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "onInstall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onUninstall",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "ownersOf",
    outputs: [
      {
        internalType: "address[]",
        name: "owners",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pluginManifest",
    outputs: [
      {
        components: [
          {
            internalType: "bytes4[]",
            name: "interfaceIds",
            type: "bytes4[]",
          },
          {
            internalType: "bytes4[]",
            name: "dependencyInterfaceIds",
            type: "bytes4[]",
          },
          {
            internalType: "bytes4[]",
            name: "executionFunctions",
            type: "bytes4[]",
          },
          {
            internalType: "bytes4[]",
            name: "permittedExecutionSelectors",
            type: "bytes4[]",
          },
          {
            internalType: "bool",
            name: "permitAnyExternalContract",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "canSpendNativeToken",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "address",
                name: "externalAddress",
                type: "address",
              },
              {
                internalType: "bool",
                name: "permitAnySelector",
                type: "bool",
              },
              {
                internalType: "bytes4[]",
                name: "selectors",
                type: "bytes4[]",
              },
            ],
            internalType: "struct ManifestExternalCallPermission[]",
            name: "permittedExternalCalls",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "bytes4",
                name: "executionSelector",
                type: "bytes4",
              },
              {
                components: [
                  {
                    internalType: "enum ManifestAssociatedFunctionType",
                    name: "functionType",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "functionId",
                    type: "uint8",
                  },
                  {
                    internalType: "uint256",
                    name: "dependencyIndex",
                    type: "uint256",
                  },
                ],
                internalType: "struct ManifestFunction",
                name: "associatedFunction",
                type: "tuple",
              },
            ],
            internalType: "struct ManifestAssociatedFunction[]",
            name: "userOpValidationFunctions",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "bytes4",
                name: "executionSelector",
                type: "bytes4",
              },
              {
                components: [
                  {
                    internalType: "enum ManifestAssociatedFunctionType",
                    name: "functionType",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "functionId",
                    type: "uint8",
                  },
                  {
                    internalType: "uint256",
                    name: "dependencyIndex",
                    type: "uint256",
                  },
                ],
                internalType: "struct ManifestFunction",
                name: "associatedFunction",
                type: "tuple",
              },
            ],
            internalType: "struct ManifestAssociatedFunction[]",
            name: "runtimeValidationFunctions",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "bytes4",
                name: "executionSelector",
                type: "bytes4",
              },
              {
                components: [
                  {
                    internalType: "enum ManifestAssociatedFunctionType",
                    name: "functionType",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "functionId",
                    type: "uint8",
                  },
                  {
                    internalType: "uint256",
                    name: "dependencyIndex",
                    type: "uint256",
                  },
                ],
                internalType: "struct ManifestFunction",
                name: "associatedFunction",
                type: "tuple",
              },
            ],
            internalType: "struct ManifestAssociatedFunction[]",
            name: "preUserOpValidationHooks",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "bytes4",
                name: "executionSelector",
                type: "bytes4",
              },
              {
                components: [
                  {
                    internalType: "enum ManifestAssociatedFunctionType",
                    name: "functionType",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "functionId",
                    type: "uint8",
                  },
                  {
                    internalType: "uint256",
                    name: "dependencyIndex",
                    type: "uint256",
                  },
                ],
                internalType: "struct ManifestFunction",
                name: "associatedFunction",
                type: "tuple",
              },
            ],
            internalType: "struct ManifestAssociatedFunction[]",
            name: "preRuntimeValidationHooks",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "bytes4",
                name: "executionSelector",
                type: "bytes4",
              },
              {
                components: [
                  {
                    internalType: "enum ManifestAssociatedFunctionType",
                    name: "functionType",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "functionId",
                    type: "uint8",
                  },
                  {
                    internalType: "uint256",
                    name: "dependencyIndex",
                    type: "uint256",
                  },
                ],
                internalType: "struct ManifestFunction",
                name: "preExecHook",
                type: "tuple",
              },
              {
                components: [
                  {
                    internalType: "enum ManifestAssociatedFunctionType",
                    name: "functionType",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "functionId",
                    type: "uint8",
                  },
                  {
                    internalType: "uint256",
                    name: "dependencyIndex",
                    type: "uint256",
                  },
                ],
                internalType: "struct ManifestFunction",
                name: "postExecHook",
                type: "tuple",
              },
            ],
            internalType: "struct ManifestExecutionHook[]",
            name: "executionHooks",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "bytes4",
                name: "executionSelector",
                type: "bytes4",
              },
              {
                components: [
                  {
                    internalType: "enum ManifestAssociatedFunctionType",
                    name: "functionType",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "functionId",
                    type: "uint8",
                  },
                  {
                    internalType: "uint256",
                    name: "dependencyIndex",
                    type: "uint256",
                  },
                ],
                internalType: "struct ManifestFunction",
                name: "preExecHook",
                type: "tuple",
              },
              {
                components: [
                  {
                    internalType: "enum ManifestAssociatedFunctionType",
                    name: "functionType",
                    type: "uint8",
                  },
                  {
                    internalType: "uint8",
                    name: "functionId",
                    type: "uint8",
                  },
                  {
                    internalType: "uint256",
                    name: "dependencyIndex",
                    type: "uint256",
                  },
                ],
                internalType: "struct ManifestFunction",
                name: "postExecHook",
                type: "tuple",
              },
            ],
            internalType: "struct ManifestExecutionHook[]",
            name: "permittedCallHooks",
            type: "tuple[]",
          },
        ],
        internalType: "struct PluginManifest",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "pluginMetadata",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "version",
            type: "string",
          },
          {
            internalType: "string",
            name: "author",
            type: "string",
          },
          {
            components: [
              {
                internalType: "bytes4",
                name: "functionSelector",
                type: "bytes4",
              },
              {
                internalType: "string",
                name: "permissionDescription",
                type: "string",
              },
            ],
            internalType: "struct SelectorPermission[]",
            name: "permissionDescriptors",
            type: "tuple[]",
          },
        ],
        internalType: "struct PluginMetadata",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "functionId",
        type: "uint8",
      },
      {
        internalType: "bytes",
        name: "preExecHookData",
        type: "bytes",
      },
    ],
    name: "postExecutionHook",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "functionId",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "sender",
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
    name: "preExecutionHook",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "functionId",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "sender",
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
    name: "preRuntimeValidationHook",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "functionId",
        type: "uint8",
      },
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
    ],
    name: "preUserOpValidationHook",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "functionId",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "runtimeValidationFunction",
    outputs: [],
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
        internalType: "address[]",
        name: "ownersToAdd",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "ownersToRemove",
        type: "address[]",
      },
    ],
    name: "updateOwners",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "functionId",
        type: "uint8",
      },
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
    ],
    name: "userOpValidationFunction",
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
] as const;
