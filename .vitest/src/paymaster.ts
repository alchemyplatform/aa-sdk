import {
  concat,
  custom,
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
  getBytecode,
  sendTransaction,
  setBalance,
  waitForTransactionReceipt,
} from "viem/actions";
import { type UserOperationRequest } from "../../aa-sdk/core/src/types";
import { ERC1967ProxyAbi } from "./Proxy";
import { VerifyingPaymasterAbi } from "./VerifyingPaymaster";
import { accounts, create2deployer } from "./constants";

// NOTE: this only assume EP 0.6.0 for now
export const paymasterTransport = (client: Client & { mode: "anvil" }) =>
  custom({
    request: async (args) => {
      if (args.method === "pm_getPaymasterStubData") {
        const [, entrypoint] = args.params as [
          UserOperationRequest,
          Address,
          Hex,
          Record<string, any>
        ];

        const { address, dummyData } = getPaymasterDetails({
          implAddress: getPaymasterImplDetails().address,
          entrypoint,
        });

        return { paymasterAndData: concat([address, dummyData]) };
      } else if (args.method === "pm_getPaymasterData") {
        const [uo, entrypoint] = args.params as [
          UserOperationRequest,
          Address,
          Hex,
          Record<string, any>
        ];

        const { address } = getPaymasterDetails({
          implAddress: getPaymasterImplDetails().address,
          entrypoint,
        });

        const contract = getContract({
          abi: VerifyingPaymasterAbi.abi,
          client: client,
          address,
        });

        const validUntil = BigInt(Date.now() + 1000 * 60 * 60 * 24);
        const validFrom = BigInt(Date.now());
        const expiry =
          (validUntil << BigInt(160)) | (validFrom << BigInt(160 + 48));

        // @ts-ignore
        const encoding = await contract.read.getHash([uo, expiry]);
        const signature = await accounts.paymasterOwner.signMessage({
          message: { raw: encoding },
        });
        const paymasterData = encodeAbiParameters(
          [
            {
              name: "address",
              type: "address",
            },
            {
              name: "expiry",
              type: "uint256",
            },
            { name: "signature", type: "bytes" },
          ],
          [address, expiry, signature]
        );

        return { paymasterAndData: concat([address, paymasterData]) };
      }

      throw new Error("Method not found");
    },
  });

export async function deployPaymasterContract(
  client: Client & { mode: "anvil" }
) {
  // give the owner some ether
  await setBalance(client, {
    address: accounts.paymasterOwner.address,
    value: parseEther("1"),
  });

  // deploy the paymaster impl
  const { address: implAddress, calldata: implCalldata } =
    getPaymasterImplDetails();

  const paymasterImplBytecode = await getBytecode(client, {
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
    getPaymasterDetails({
      implAddress,
      // for now we just support 0.6.0
      entrypoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    });

  const proxyBytecode = await getBytecode(client, { address: proxyAddress });

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
  await setBalance(client, {
    address: proxyAddress,
    value: parseEther("1"),
  });

  return proxyAddress;
}

export function getPaymasterImplDetails() {
  const implSalt = toHex(0, { size: 32 });
  const implAddress = getContractAddress({
    from: create2deployer,
    opcode: "CREATE2",
    salt: implSalt,
    bytecode: VerifyingPaymasterAbi.bytecode.object,
  });

  return {
    salt: implSalt,
    address: implAddress,
    bytecode: VerifyingPaymasterAbi.bytecode.object,
    calldata: concat([implSalt, VerifyingPaymasterAbi.bytecode.object]),
  };
}

export function getPaymasterDetails({
  implAddress,
  entrypoint,
}: {
  implAddress: Address;
  entrypoint: Address;
}) {
  const proxyCallData = encodeFunctionData({
    abi: VerifyingPaymasterAbi.abi,
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
      [implAddress, proxyCallData]
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
    // this is EP 0.6.0, concat of dummy time range and signature
    dummyData: concat([
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    ]),
    bytecode: proxyInitBytecode,
    calldata: concat([proxySalt, proxyInitBytecode]),
  };
}
