import {
  concat,
  custom,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
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
import { accounts, create2deployer, entrypoint060 } from "./constants";

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

        const validUntil = 0n;
        const validFrom = 0n;
        const expiry =
          (validUntil << BigInt(160)) | (validFrom << BigInt(160 + 48));

        // @ts-ignore
        const encoding = await contract.read.getHash([uo, expiry]);
        const signature = await accounts.paymasterOwner.signMessage({
          message: { raw: encoding },
        });

        const paymasterAndData = encodePacked(
          ["address", "uint256", "bytes"],
          [address, expiry, signature]
        ) as Hex;

        return { paymasterAndData };
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
    value: parseEther("10"),
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
      entrypoint: entrypoint060,
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
  // 0.6 doesn't support direct transfer, so we have to call deposit
  const contract = getContract({
    abi: VerifyingPaymasterAbi.abi,
    client,
    address: proxyAddress,
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
