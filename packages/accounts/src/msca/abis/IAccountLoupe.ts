export const IAccountLoupeAbi = [
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
        name: "",
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
        name: "",
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
        name: "",
        type: "address[]",
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
        name: "",
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
] as const;
