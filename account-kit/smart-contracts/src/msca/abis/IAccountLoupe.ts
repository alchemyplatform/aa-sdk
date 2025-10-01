export const IAccountLoupeAbi = [
  {
    type: "function",
    name: "getExecutionFunctionConfig",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    outputs: [
      {
        name: "",
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
        name: "",
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
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
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
] as const;
