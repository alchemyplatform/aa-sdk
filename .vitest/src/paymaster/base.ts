import { type UserOperationRequest } from "@aa-sdk/core";
import {
  concat,
  encodeAbiParameters,
  encodeFunctionData,
  getContract,
  getContractAddress,
  parseEther,
  toHex,
  type Address,
  type Client,
  type Hex,
} from "viem";
import {
  getCode,
  sendTransaction,
  setBalance,
  waitForTransactionReceipt,
} from "viem/actions";
import { accounts, create2deployer } from "../constants";
import { ERC1967ProxyAbi } from "../Proxy";
import type { Paymaster } from "./types";
import type { VerifyingPaymaster060Abi } from "./VerifyingPaymaster060";
import type { VerifyingPaymaster070Abi } from "./VerifyingPaymaster070";

type ToPaymasterArgs = {
  entryPointVersion: "0.6.0" | "0.7.0";
  entryPointAddress: Address;
  abi: typeof VerifyingPaymaster060Abi | typeof VerifyingPaymaster070Abi;
  dummyData: Hex;
  getPaymasterStubData: (
    self: Paymaster,
  ) => { paymasterAndData: Hex } | { paymaster: Address; paymasterData: Hex };
  getPaymasterData: (
    self: Paymaster,
    uo: UserOperationRequest,
    client: Client & { mode: "anvil" },
  ) => Promise<
    { paymasterAndData: Hex } | { paymaster: Address; paymasterData: Hex }
  >;
};

export const toPaymaster = (args: ToPaymasterArgs): Paymaster => {
  const {
    abi,
    dummyData,
    getPaymasterData: getPaymasterData_,
    getPaymasterStubData: getPaymasterStubData_,
    ...rest
  } = args;

  const paymaster: Paymaster = {
    ...rest,
    getPaymasterData(uo, client) {
      return getPaymasterData_(paymaster, uo, client);
    },
    getPaymasterStubData() {
      return getPaymasterStubData_(paymaster);
    },
    async deployPaymasterContract(client) {
      // give the owner some ether
      await setBalance(client, {
        address: accounts.paymasterOwner.address,
        value: parseEther("10"),
      });

      // deploy the paymaster impl
      const { address: implAddress, calldata: implCalldata } =
        this.getPaymasterImplDetails();

      const paymasterImplBytecode = await getCode(client, {
        address: implAddress,
      });

      if (paymasterImplBytecode == null || paymasterImplBytecode === "0x") {
        // deploy the paymaster impl
        const hash = await sendTransaction(client, {
          to: create2deployer,
          data: implCalldata,
          account: accounts.paymasterOwner,
          chain: client.chain,
        });

        await waitForTransactionReceipt(client, { hash });
      }

      const { address: proxyAddress, calldata: proxyCalldata } =
        this.getPaymasterDetails();

      const proxyBytecode = await getCode(client, {
        address: proxyAddress,
      });

      if (proxyBytecode == null || proxyBytecode === "0x") {
        // deploy the paymaster impl
        const hash = await sendTransaction(client, {
          to: create2deployer,
          data: proxyCalldata,
          account: accounts.paymasterOwner,
          chain: client.chain,
        });

        await waitForTransactionReceipt(client, { hash });
      }

      // give the paymaster some balance too
      // 0.6 doesn't support direct transfer, so we have to call deposit
      const contract = getContract({
        abi: abi.abi,
        client,
        address: proxyAddress,
      });

      await setBalance(client, {
        address: proxyAddress,
        value: parseEther("5"),
      });

      await contract.write.deposit({
        value: parseEther("5"),
        account: accounts.paymasterOwner,
        chain: client.chain,
      });

      await contract.write.addStake([84600], {
        value: parseEther("1"),
        account: accounts.paymasterOwner,
        chain: client.chain,
      });

      return proxyAddress;
    },
    getPaymasterDetails() {
      const { address: implAddress } = this.getPaymasterImplDetails();
      const entrypoint = this.entryPointAddress;

      const proxyCallData = encodeFunctionData({
        abi: abi.abi,
        functionName: "initialize",
        args: [
          // for now this just deploy 0.6.0
          entrypoint,
          // signer, owner, pauser
          accounts.paymasterOwner.address,
          accounts.paymasterOwner.address,
          accounts.paymasterOwner.address,
        ],
      });

      const proxyInitBytecode = concat([
        ERC1967ProxyAbi.bytecode.object,
        encodeAbiParameters(
          [
            { name: "verifyingPaymaster", type: "address" },
            { name: "proxyCallData", type: "bytes" },
          ],
          [implAddress, proxyCallData],
        ),
      ]);

      const proxySalt = toHex(1, { size: 32 });
      const proxyAddress = getContractAddress({
        from: create2deployer,
        opcode: "CREATE2",
        salt: proxySalt,
        bytecode: proxyInitBytecode,
      });

      return {
        salt: proxySalt,
        address: proxyAddress,
        dummyData: dummyData,
        bytecode: proxyInitBytecode,
        calldata: concat([proxySalt, proxyInitBytecode]),
      };
    },
    getPaymasterImplDetails() {
      const implSalt = toHex(0, { size: 32 });
      const implAddress = getContractAddress({
        from: create2deployer,
        opcode: "CREATE2",
        salt: implSalt,
        bytecode: abi.bytecode.object,
      });

      return {
        salt: implSalt,
        address: implAddress,
        bytecode: abi.bytecode.object,
        calldata: concat([implSalt, abi.bytecode.object]),
      };
    },
  };

  return paymaster;
};
