export const IPluginManagerAbi = [
  {
    type: "function",
    name: "installPlugin",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "manifestHash", type: "bytes32", internalType: "bytes32" },
      { name: "pluginInitData", type: "bytes", internalType: "bytes" },
      {
        name: "dependencies",
        type: "bytes21[]",
        internalType: "FunctionReference[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "uninstallPlugin",
    inputs: [
      { name: "plugin", type: "address", internalType: "address" },
      { name: "config", type: "bytes", internalType: "bytes" },
      { name: "pluginUninstallData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "PluginIgnoredHookUnapplyCallbackFailure",
    inputs: [
      {
        name: "plugin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "providingPlugin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PluginIgnoredUninstallCallbackFailure",
    inputs: [
      {
        name: "plugin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PluginInstalled",
    inputs: [
      {
        name: "plugin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "manifestHash",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "dependencies",
        type: "bytes21[]",
        indexed: false,
        internalType: "FunctionReference[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PluginUninstalled",
    inputs: [
      {
        name: "plugin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "callbacksSucceeded",
        type: "bool",
        indexed: true,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
] as const;
