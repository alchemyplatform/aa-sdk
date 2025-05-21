import type { UserOperationRequest } from "@aa-sdk/core";
import type { Address, Client, Hex } from "viem";

export type Paymaster = {
  entryPointVersion: "0.6.0" | "0.7.0";
  entryPointAddress: Address;
  getPaymasterStubData: () =>
    | {
        paymasterAndData: Hex;
      }
    | { paymaster: Address; paymasterData: Hex };
  getPaymasterData: (
    uo: UserOperationRequest,
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
};
