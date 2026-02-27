import type { Address, Client, Hex, RpcUserOperation } from "viem";

export type Paymaster = {
  entryPointVersion: "0.6.0" | "0.7.0" | "0.8.0";
  entryPointAddress: Address;
  getPaymasterStubData: () =>
    | {
        paymasterAndData: Hex;
      }
    | { paymaster: Address; paymasterData: Hex };
  getPaymasterData: (
    uo: RpcUserOperation,
    client: Client & { mode: "anvil" },
  ) => Promise<
    { paymasterAndData: Hex } | { paymaster: Address; paymasterData: Hex }
  >;
  deployPaymasterContract: (
    client: Client & { mode: "anvil" },
  ) => Promise<Address>;
  getPaymasterDetails: () => {
    salt: Hex;
    address: Address;
    dummyData: Hex;
    bytecode: Hex;
    calldata: Hex;
  };
  getPaymasterImplDetails: () => {
    salt: Hex;
    address: Hex;
    bytecode: Hex;
    calldata: Hex;
  };
  isV07Abi: boolean;
};
