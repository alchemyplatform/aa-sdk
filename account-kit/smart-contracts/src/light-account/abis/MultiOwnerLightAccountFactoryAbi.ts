export const MultiOwnerLightAccountFactoryAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      {
        name: "entryPoint",
        type: "address",
        internalType: "contract IEntryPoint",
      },
    ],
    stateMutability: "nonpayable",
  },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    name: "ACCOUNT_IMPLEMENTATION",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract MultiOwnerLightAccount",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ENTRY_POINT",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IEntryPoint",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "acceptOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addStake",
    inputs: [
      { name: "unstakeDelay", type: "uint32", internalType: "uint32" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "createAccount",
    inputs: [
      { name: "owners", type: "address[]", internalType: "address[]" },
      { name: "salt", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "account",
        type: "address",
        internalType: "contract MultiOwnerLightAccount",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createAccountSingle",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "salt", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "account",
        type: "address",
        internalType: "contract MultiOwnerLightAccount",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAddress",
    inputs: [
      { name: "owners", type: "address[]", internalType: "address[]" },
      { name: "salt", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingOwner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unlockStake",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "to", type: "address", internalType: "address payable" },
      { name: "token", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawStake",
    inputs: [{ name: "to", type: "address", internalType: "address payable" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "OwnershipTransferStarted",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [{ name: "target", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "AddressInsufficientBalance",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
  { type: "error", name: "FailedInnerCall", inputs: [] },
  { type: "error", name: "InvalidAction", inputs: [] },
  {
    type: "error",
    name: "InvalidEntryPoint",
    inputs: [{ name: "entryPoint", type: "address", internalType: "address" }],
  },
  { type: "error", name: "InvalidOwners", inputs: [] },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
  { type: "error", name: "OwnersArrayEmpty", inputs: [] },
  { type: "error", name: "OwnersLimitExceeded", inputs: [] },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
  { type: "error", name: "TransferFailed", inputs: [] },
  { type: "error", name: "ZeroAddressNotAllowed", inputs: [] },
] as const;
