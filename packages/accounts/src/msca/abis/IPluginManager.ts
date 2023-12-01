export const IPluginManagerAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "providingPlugin",
        type: "address",
      },
    ],
    name: "PluginIgnoredHookUnapplyCallbackFailure",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "plugin",
        type: "address",
      },
    ],
    name: "PluginIgnoredUninstallCallbackFailure",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "manifestHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "FunctionReference[]",
        name: "dependencies",
        type: "bytes21[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "providingPlugin",
            type: "address",
          },
          {
            internalType: "bytes4",
            name: "selector",
            type: "bytes4",
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
            name: "hookApplyData",
            type: "bytes",
          },
        ],
        indexed: false,
        internalType: "struct IPluginManager.InjectedHook[]",
        name: "injectedHooks",
        type: "tuple[]",
      },
    ],
    name: "PluginInstalled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bool",
        name: "callbacksSucceeded",
        type: "bool",
      },
    ],
    name: "PluginUninstalled",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "manifestHash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "pluginInitData",
        type: "bytes",
      },
      {
        internalType: "FunctionReference[]",
        name: "dependencies",
        type: "bytes21[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "providingPlugin",
            type: "address",
          },
          {
            internalType: "bytes4",
            name: "selector",
            type: "bytes4",
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
            name: "hookApplyData",
            type: "bytes",
          },
        ],
        internalType: "struct IPluginManager.InjectedHook[]",
        name: "injectedHooks",
        type: "tuple[]",
      },
    ],
    name: "installPlugin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "plugin",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "config",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "pluginUninstallData",
        type: "bytes",
      },
      {
        internalType: "bytes[]",
        name: "hookUnapplyData",
        type: "bytes[]",
      },
    ],
    name: "uninstallPlugin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
