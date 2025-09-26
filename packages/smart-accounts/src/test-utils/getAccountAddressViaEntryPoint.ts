import { getContract, type Address, type Hex, type Client } from "viem";

/**
 * Test utility functilln that computes the counterfactual address using the EntryPoint's getSenderAddress function.
 * This is copied from v4's @aa-sdk/core's getAccountAddress logic.
 *
 * @param {object} params - The parameters object
 * @param {Client} params.client - The viem client for blockchain interaction
 * @param {Address} params.entryPointAddress - The EntryPoint contract address
 * @param {Array} params.entryPointAbi - The EntryPoint contract ABI
 * @param {() => Promise<Hex>} params.getAccountInitCode - Function that returns the account init code
 * @returns {Promise<Address>} Promise that resolves to the counterfactual account address
 */
export async function getAccountAddressViaEntryPoint({
  client,
  entryPointAddress,
  entryPointAbi,
  getAccountInitCode,
}: {
  client: Client;
  entryPointAddress: Address;
  entryPointAbi: readonly any[];
  getAccountInitCode: () => Promise<Hex>;
}): Promise<Address> {
  const entryPointContract = getContract({
    address: entryPointAddress,
    abi: entryPointAbi,
    client,
  });

  const initCode = await getAccountInitCode();

  try {
    await entryPointContract.simulate.getSenderAddress([initCode]);
  } catch (err: any) {
    if (err.cause?.data?.errorName === "SenderAddressResult") {
      return err.cause.data.args[0] as Address;
    }
    throw err;
  }

  throw new Error("Failed to get counterfactual address");
}
