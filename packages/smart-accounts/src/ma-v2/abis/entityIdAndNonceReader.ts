export const entityIdAndNonceReaderAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "contract IModularAccountView",
      },
      {
        name: "ep",
        type: "address",
        internalType: "contract IEntryPoint",
      },
      {
        name: "nonce",
        type: "uint192",
        internalType: "uint192",
      },
    ],
    stateMutability: "nonpayable",
  },
];
