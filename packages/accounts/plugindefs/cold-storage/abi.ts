export const ColdStoragePluginAbi = [
  {
    type: "function",
    name: "changeStorageKey",
    inputs: [{ name: "storageKey", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "erc721AllLocks",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "executeWithStorageKey",
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
    outputs: [{ name: "", type: "bytes[]", internalType: "bytes[]" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getERC721Locks",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [
      { name: "allDuration", type: "uint48", internalType: "uint48" },
      {
        name: "collectionLocks",
        type: "tuple[]",
        internalType: "struct IColdStoragePlugin.ERC721CollectionLock[]",
        components: [
          {
            name: "contractAddress",
            type: "address",
            internalType: "address",
          },
          { name: "duration", type: "uint48", internalType: "uint48" },
        ],
      },
      {
        name: "tokenLocks",
        type: "tuple[]",
        internalType: "struct IColdStoragePlugin.ERC721TokenLock[]",
        components: [
          {
            name: "token",
            type: "tuple",
            internalType: "struct IColdStoragePlugin.ERC721Token",
            components: [
              {
                name: "contractAddress",
                type: "address",
                internalType: "address",
              },
              {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          { name: "duration", type: "uint48", internalType: "uint48" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isERC721TokenLocked",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "collection", type: "address", internalType: "address" },
      { name: "tokenId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "lockERC721All",
    inputs: [{ name: "duration", type: "uint48", internalType: "uint48" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "lockERC721Collection",
    inputs: [
      {
        name: "locks",
        type: "tuple[]",
        internalType: "struct IColdStoragePlugin.ERC721CollectionLock[]",
        components: [
          {
            name: "contractAddress",
            type: "address",
            internalType: "address",
          },
          { name: "duration", type: "uint48", internalType: "uint48" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "lockERC721Token",
    inputs: [
      {
        name: "locks",
        type: "tuple[]",
        internalType: "struct IColdStoragePlugin.ERC721TokenLock[]",
        components: [
          {
            name: "token",
            type: "tuple",
            internalType: "struct IColdStoragePlugin.ERC721Token",
            components: [
              {
                name: "contractAddress",
                type: "address",
                internalType: "address",
              },
              {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          { name: "duration", type: "uint48", internalType: "uint48" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "view",
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
    name: "removeSelector",
    inputs: [{ name: "data", type: "bytes", internalType: "bytes" }],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "pure",
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
    name: "storageKeyOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "storageKeys",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
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
    name: "unlockERC721All",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unlockERC721Collection",
    inputs: [
      {
        name: "collections",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unlockERC721Token",
    inputs: [
      {
        name: "tokens",
        type: "tuple[]",
        internalType: "struct IColdStoragePlugin.ERC721Token[]",
        components: [
          {
            name: "contractAddress",
            type: "address",
            internalType: "address",
          },
          { name: "tokenId", type: "uint256", internalType: "uint256" },
        ],
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
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ERC721CollectionsLocked",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "locks",
        type: "tuple[]",
        indexed: false,
        internalType: "struct IColdStoragePlugin.ERC721CollectionLock[]",
        components: [
          {
            name: "contractAddress",
            type: "address",
            internalType: "address",
          },
          { name: "duration", type: "uint48", internalType: "uint48" },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ERC721Locked",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "duration",
        type: "uint48",
        indexed: false,
        internalType: "uint48",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ERC721TokensLocked",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "locks",
        type: "tuple[]",
        indexed: false,
        internalType: "struct IColdStoragePlugin.ERC721TokenLock[]",
        components: [
          {
            name: "token",
            type: "tuple",
            internalType: "struct IColdStoragePlugin.ERC721Token",
            components: [
              {
                name: "contractAddress",
                type: "address",
                internalType: "address",
              },
              {
                name: "tokenId",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          { name: "duration", type: "uint48", internalType: "uint48" },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StorageKeyChanged",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "oldStorageKey",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newStorageKey",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "AlreadyInitialized", inputs: [] },
  { type: "error", name: "ColdStorageAccessDenied", inputs: [] },
  { type: "error", name: "InvalidAction", inputs: [] },
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
] as const;
