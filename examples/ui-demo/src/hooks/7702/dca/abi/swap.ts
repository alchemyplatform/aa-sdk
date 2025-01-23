export const swapAbi = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      {
        name: "amount1",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amount2",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapUSDCtoWETH",
    inputs: [
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amountOut",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapWETHtoUSDC",
    inputs: [
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amountOut",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "usdc",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ERC20Mintable",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "weth",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ERC20Mintable",
      },
    ],
    stateMutability: "view",
  },
] as const;
