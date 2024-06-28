import { getEntryPoint, toSmartContractAccount } from "@aa-sdk/core";
import { http, type SignableMessage } from "viem";
import { sepolia } from "viem/chains";

const myAccount = await toSmartContractAccount({
  /// REQUIRED PARAMS ///
  source: "MyAccount",
  transport: http("RPC_URL"),
  chain: sepolia,
  // The EntryPointDef that your account is com"patible with
  entryPoint: getEntryPoint(sepolia, { version: "0.6.0" }),
  // This should return a concatenation of your `factoryAddress` and the `callData` for your factory's create account method
  getAccountInitCode: async () => "0x{factoryAddress}{callData}",
  // an invalid signature that doesn't cause your account to revert during validation
  getDummySignature: () => "0x1234...",
  // given a UO in the form of {target, data, value} should output the calldata for calling your contract's execution method
  encodeExecute: async (uo) => "0xcalldata",
  signMessage: async ({ message }: { message: SignableMessage }) => "0x...",
  signTypedData: async (typedData) => "0x000",

  /// OPTIONAL PARAMS ///
  // if you already know your account's address, pass that in here to avoid generating a new counterfactual
  accountAddress: "0xaddressoverride",
  // if your account supports batching, this should take an array of UOs and return the calldata for calling your contract's batchExecute method
  encodeBatchExecute: async (uos) => "0x...",
  // if your contract expects a different signing scheme than the default signMessage scheme, you can override that here
  signUserOperationHash: async (hash) => "0x...",
  // allows you to define the calldata for upgrading your account
  encodeUpgradeToAndCall: async (params) => "0x...",
});
