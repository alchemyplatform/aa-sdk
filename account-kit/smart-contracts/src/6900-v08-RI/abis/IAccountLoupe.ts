export const IAccountLoupeAbi = [
  {
    type: "function",
    name: "getExecutionFunctionHandler",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    outputs: [{ name: "module", type: "address", internalType: "address" }],
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
        internalType: "struct ExecutionHook[]",
        components: [
          {
            name: "hookFunction",
            type: "bytes24",
            internalType: "ModuleEntity",
          },
          { name: "isPreHook", type: "bool", internalType: "bool" },
          { name: "isPostHook", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPermissionHooks",
    inputs: [
      {
        name: "validationFunction",
        type: "bytes24",
        internalType: "ModuleEntity",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct ExecutionHook[]",
        components: [
          {
            name: "hookFunction",
            type: "bytes24",
            internalType: "ModuleEntity",
          },
          { name: "isPreHook", type: "bool", internalType: "bool" },
          { name: "isPostHook", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPreValidationHooks",
    inputs: [
      {
        name: "validationFunction",
        type: "bytes24",
        internalType: "ModuleEntity",
      },
    ],
    outputs: [
      {
        name: "preValidationHooks",
        type: "bytes24[]",
        internalType: "ModuleEntity[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSelectors",
    inputs: [
      {
        name: "validationFunction",
        type: "bytes24",
        internalType: "ModuleEntity",
      },
    ],
    outputs: [{ name: "", type: "bytes4[]", internalType: "bytes4[]" }],
    stateMutability: "view",
  },
] as const;
