export const accountFactoryAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_entryPoint",
        type: "address",
        internalType: "contract IEntryPoint",
      },
      {
        name: "_accountImpl",
        type: "address",
        internalType: "contract ModularAccount",
      },
      {
        name: "_semiModularImpl",
        type: "address",
        internalType: "contract SemiModularAccountBytecode",
      },
      {
        name: "_singleSignerValidationModule",
        type: "address",
        internalType: "address",
      },
      {
        name: "_webAuthnValidationModule",
        type: "address",
        internalType: "address",
      },
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ACCOUNT_IMPL",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ModularAccount",
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
    name: "SEMI_MODULAR_ACCOUNT_IMPL",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract SemiModularAccountBytecode",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "SINGLE_SIGNER_VALIDATION_MODULE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "WEBAUTHN_VALIDATION_MODULE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
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
      {
        name: "unstakeDelay",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  // Omitted, as this has been deprecated in favor of createSemiModularAccount.
  // {
  //   type: "function",
  //   name: "createAccount",
  //   inputs: [
  //     {
  //       name: "owner",
  //       type: "address",
  //       internalType: "address",
  //     },
  //     {
  //       name: "salt",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "entityId",
  //       type: "uint32",
  //       internalType: "uint32",
  //     },
  //   ],
  //   outputs: [
  //     {
  //       name: "",
  //       type: "address",
  //       internalType: "contract ModularAccount",
  //     },
  //   ],
  //   stateMutability: "nonpayable",
  // },
  {
    type: "function",
    name: "createSemiModularAccount",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "salt",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract SemiModularAccountBytecode",
      },
    ],
    stateMutability: "nonpayable",
  },
  // Omitted, as this has been deprecated in favor of using the webAuthn factory.
  // {
  //   type: "function",
  //   name: "createWebAuthnAccount",
  //   inputs: [
  //     {
  //       name: "ownerX",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "ownerY",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "salt",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "entityId",
  //       type: "uint32",
  //       internalType: "uint32",
  //     },
  //   ],
  //   outputs: [
  //     {
  //       name: "",
  //       type: "address",
  //       internalType: "contract ModularAccount",
  //     },
  //   ],
  //   stateMutability: "nonpayable",
  // },
  // Omitted, as this has been deprecated in favor of using the webAuthn factory.
  // {
  //   type: "function",
  //   name: "getAddress",
  //   inputs: [
  //     {
  //       name: "owner",
  //       type: "address",
  //       internalType: "address",
  //     },
  //     {
  //       name: "salt",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "entityId",
  //       type: "uint32",
  //       internalType: "uint32",
  //     },
  //   ],
  //   outputs: [
  //     {
  //       name: "",
  //       type: "address",
  //       internalType: "address",
  //     },
  //   ],
  //   stateMutability: "view",
  // },
  {
    type: "function",
    name: "getAddressSemiModular",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "salt",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  // Omitted, as this has been deprecated in favor of using the webAuthn factory.
  // {
  //   type: "function",
  //   name: "getAddressWebAuthn",
  //   inputs: [
  //     {
  //       name: "ownerX",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "ownerY",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "salt",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "entityId",
  //       type: "uint32",
  //       internalType: "uint32",
  //     },
  //   ],
  //   outputs: [
  //     {
  //       name: "",
  //       type: "address",
  //       internalType: "address",
  //     },
  //   ],
  //   stateMutability: "view",
  // },
  // Omitted, as this has been deprecated in favor of using getSaltSemiModular.
  // {
  //   type: "function",
  //   name: "getSalt",
  //   inputs: [
  //     {
  //       name: "owner",
  //       type: "address",
  //       internalType: "address",
  //     },
  //     {
  //       name: "salt",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "entityId",
  //       type: "uint32",
  //       internalType: "uint32",
  //     },
  //   ],
  //   outputs: [
  //     {
  //       name: "",
  //       type: "bytes32",
  //       internalType: "bytes32",
  //     },
  //   ],
  //   stateMutability: "pure",
  // },
  // Omitted, as this has been deprecated in favor of using the webAuthn factory.
  // {
  //   type: "function",
  //   name: "getSaltWebAuthn",
  //   inputs: [
  //     {
  //       name: "ownerX",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "ownerY",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "salt",
  //       type: "uint256",
  //       internalType: "uint256",
  //     },
  //     {
  //       name: "entityId",
  //       type: "uint32",
  //       internalType: "uint32",
  //     },
  //   ],
  //   outputs: [
  //     {
  //       name: "",
  //       type: "bytes32",
  //       internalType: "bytes32",
  //     },
  //   ],
  //   stateMutability: "pure",
  // },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pendingOwner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
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
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
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
      {
        name: "to",
        type: "address",
        internalType: "address payable",
      },
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawStake",
    inputs: [
      {
        name: "withdrawAddress",
        type: "address",
        internalType: "address payable",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ModularAccountDeployed",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "salt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
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
    type: "event",
    name: "SemiModularAccountDeployed",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "salt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WebAuthnModularAccountDeployed",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "ownerX",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "ownerY",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "salt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "AddressInsufficientBalance",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "FailedInnerCall",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidAction",
    inputs: [],
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "TransferFailed",
    inputs: [],
  },
] as const;
