export const IAccountLoupeV08Abi = [
  {
    type: "function",
    name: "getExecutionData",
    inputs: [{ name: "selector", type: "bytes4", internalType: "bytes4" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct ExecutionDataView",
        components: [
          { name: "module", type: "address", internalType: "address" },
          { name: "isPublic", type: "bool", internalType: "bool" },
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
        name: "",
        type: "tuple",
        internalType: "struct ValidationDataView",
        components: [
          { name: "isGlobal", type: "bool", internalType: "bool" },
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
          { name: "selectors", type: "bytes4[]", internalType: "bytes4[]" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;
