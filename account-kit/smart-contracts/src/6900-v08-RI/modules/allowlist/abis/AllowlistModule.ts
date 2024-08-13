export const AllowlistModuleAbi = [
  {
    type: "function",
    name: "checkAllowlistCalldata",
    inputs: [
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "moduleMetadata",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct ModuleMetadata",
        components: [
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
          {
            name: "version",
            type: "string",
            internalType: "string",
          },
          {
            name: "author",
            type: "string",
            internalType: "string",
          },
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
          {
            name: "permissionRequest",
            type: "string[]",
            internalType: "string[]",
          },
        ],
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "onInstall",
    inputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onUninstall",
    inputs: [
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "preRuntimeValidationHook",
    inputs: [
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "preUserOpValidationHook",
    inputs: [
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
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
    name: "selectorAllowlist",
    inputs: [
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
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
    name: "setAllowlistSelector",
    inputs: [
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "selector",
        type: "bytes4",
        internalType: "bytes4",
      },
      {
        name: "allowed",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setAllowlistTarget",
    inputs: [
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "allowed",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "hasSelectorAllowlist",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "targetAllowlist",
    inputs: [
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "allowed",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "hasSelectorAllowlist",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AllowlistSelectorUpdated",
    inputs: [
      {
        name: "entityId",
        type: "uint32",
        indexed: true,
        internalType: "uint32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "targetAndSelector",
        type: "bytes24",
        indexed: true,
        internalType: "bytes24",
      },
      {
        name: "allowed",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AllowlistTargetUpdated",
    inputs: [
      {
        name: "entityId",
        type: "uint32",
        indexed: true,
        internalType: "uint32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "target",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "entry",
        type: "tuple",
        indexed: false,
        internalType: "struct AllowlistModule.AllowlistEntry",
        components: [
          {
            name: "allowed",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "hasSelectorAllowlist",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "NoSelectorSpecified",
    inputs: [],
  },
  {
    type: "error",
    name: "NotImplemented",
    inputs: [],
  },
  {
    type: "error",
    name: "SelectorNotAllowed",
    inputs: [],
  },
  {
    type: "error",
    name: "TargetNotAllowed",
    inputs: [],
  },
] as const;
