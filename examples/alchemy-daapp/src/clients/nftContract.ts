export const NFTContractABI = {
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
      ],
      name: "mintTo",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
  ],
};
