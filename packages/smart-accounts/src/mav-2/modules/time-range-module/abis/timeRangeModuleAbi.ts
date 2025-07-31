export const timeRangeModuleAbi = [
  {
    type: "function",
    name: "moduleId",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
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
        name: "",
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
    name: "preSignatureValidationHook",
    inputs: [
      {
        name: "",
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
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "pure",
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
    name: "setTimeRange",
    inputs: [
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "validUntil",
        type: "uint48",
        internalType: "uint48",
      },
      {
        name: "validAfter",
        type: "uint48",
        internalType: "uint48",
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
    name: "timeRanges",
    inputs: [
      {
        name: "entityId",
        type: "uint32",
        internalType: "uint32",
      },
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "validUntil",
        type: "uint48",
        internalType: "uint48",
      },
      {
        name: "validAfter",
        type: "uint48",
        internalType: "uint48",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "TimeRangeSet",
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
        name: "validUntil",
        type: "uint48",
        indexed: false,
        internalType: "uint48",
      },
      {
        name: "validAfter",
        type: "uint48",
        indexed: false,
        internalType: "uint48",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "NotImplemented",
    inputs: [],
  },
  {
    type: "error",
    name: "TimeRangeNotValid",
    inputs: [],
  },
  {
    type: "error",
    name: "UnexpectedDataPassed",
    inputs: [],
  },
] as const;
