import { localInstance } from "~test/instances.js";
import {
  publicActions,
  type TestActions,
  testActions,
  type LocalAccount,
  type Address,
  type Hex,
  custom,
  createPublicClient,
  type JsonRpcAccount,
  type OneOf,
  isAddress,
  parseEther,
  zeroAddress,
  hexToBigInt,
  type Call,
  serializeErc6492Signature,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  createBundlerClient,
  createPaymasterClient,
} from "viem/account-abstraction";
import { estimateFeesPerGas } from "@alchemy/aa-infra";
import { toMultiOwnerModularAccountV1 } from "./multi-owner-account.js";
import { multiOwnerModularAccountV1Actions } from "../decorators/multiOwner.js";
import { setBalance } from "viem/actions";

// Note: These tests maintain a shared state to not break the local-running rundler by desyncing the chain.
describe("MA v1 Account Tests", async () => {
  let client: ReturnType<typeof localInstance.getClient> &
    ReturnType<typeof publicActions> &
    TestActions;

  beforeAll(async () => {
    client = localInstance
      .getClient()
      .extend(publicActions)
      .extend(testActions({ mode: "anvil" }));
  });

  let signer: LocalAccount;
  let otherOwners: LocalAccount[];

  beforeEach(async () => {
    signer = privateKeyToAccount(generatePrivateKey());
    otherOwners = [
      privateKeyToAccount(generatePrivateKey()),
      privateKeyToAccount(generatePrivateKey()),
    ];
  });

  it("should successfully get counterfactual address", async () => {
    const provider = await givenConnectedProvider({
      signer,
      otherOwners,
    });
    expect(isAddress(provider.account.address)).toBe(true);
  });

  it("should derive correct address from factoryData without accountAddress", async () => {
    // First create an account normally to get expected address and factory data
    const provider = await givenConnectedProvider({
      signer,
      otherOwners,
    });
    const expectedAddress = provider.account.address;
    const { factory, factoryData } = await provider.account.getFactoryArgs();

    // Now create another account with just factoryData (no accountAddress)
    // and verify it derives the same address via getSenderFromFactoryData
    const providerWithFactoryData = await givenConnectedProvider({
      signer,
      otherOwners,
      factoryAddress: factory,
      factoryData,
    });

    expect(providerWithFactoryData.account.address).toBe(expectedAddress);
  });

  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({ signer, otherOwners });

    await setBalance(client, {
      address: provider.account.address,
      value: parseEther("10"),
    });

    const result = provider.sendUserOperation({
      calls: [
        {
          to: zeroAddress,
          data: "0x",
          value: parseEther("1"),
        },
      ],
    });

    await expect(result).resolves.not.toThrowError();
  });

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = await givenConnectedProvider({
      signer,
      otherOwners,
      accountAddress,
    });

    const result = provider.sendUserOperation({
      calls: [
        {
          to: zeroAddress,
          data: "0x",
        },
      ],
    });

    await expect(result).rejects.toThrowError();
  });

  it(
    "should successfully execute with paymaster",
    { retry: 3, timeout: 30_000 },
    async () => {
      const provider = await givenConnectedProvider({
        signer,
        otherOwners,
        paymaster: true,
      });

      const hash = await provider.sendUserOperation({
        calls: [
          {
            to: zeroAddress,
            data: "0x",
          },
        ],
      });

      const txnHash = provider.waitForUserOperationReceipt({ hash });

      await expect(txnHash).resolves.not.toThrowError();
    },
  );

  it("should sign message with 6492 successfully for undeployed account", async () => {
    const { account } = await givenConnectedProvider({
      signer,
      otherOwners,
    });
    const message = "test";

    const signature = await account.signMessage({ message });
    expect(
      await client.verifyMessage({
        address: account.address,
        message,
        signature,
      }),
    ).toBe(true);
  });

  it("should sign typed data with 6492 successfully for undeployed account", async () => {
    const { account } = await givenConnectedProvider({
      signer,
      otherOwners,
    });

    const typedData = {
      types: {
        Request: [{ name: "hello", type: "string" }],
      },
      primaryType: "Request",
      message: {
        hello: "world",
      },
    } as const;

    const signature = await account.signTypedData(typedData);

    expect(
      await client.verifyTypedData({
        ...typedData,
        address: account.address,
        signature,
      }),
    ).toBe(true);
  });

  it("should get on-chain owner addresses successfully", async () => {
    const provider = await givenConnectedProvider({
      signer,
      otherOwners,
    });

    await setBalance(localInstance.getClient(), {
      address: provider.account.address,
      value: parseEther("10"),
    });

    // Send a UO to deploy the account.
    const result = await provider.sendUserOperation({
      calls: [
        {
          to: zeroAddress,
          data: "0x",
          value: 0n,
        },
      ],
    });

    await provider.waitForUserOperationReceipt({ hash: result });

    expect(sortOwners(await provider.account.getOwnerAddresses())).toEqual(
      sortOwners([signer.address, ...otherOwners.map((o) => o.address)]),
    );
  });

  it(
    "should update ownership successfully",
    { retry: 3, timeout: 120_000 },
    async () => {
      // create a throwaway address
      const throwawaySigner = privateKeyToAccount(generatePrivateKey());

      const throwawayClient = await givenConnectedProvider({
        signer: throwawaySigner,
      });

      // fund the throwaway address
      await setBalance(client, {
        address: throwawayClient.account.address,
        value: parseEther("10"),
      });

      const hash = await throwawayClient.updateOwners({
        ownersToAdd: [signer.address, ...otherOwners.map((o) => o.address)],
        ownersToRemove: [throwawaySigner.address],
      });

      await throwawayClient.waitForUserOperationReceipt({ hash });

      const newOwnerClient = await givenConnectedProvider({
        signer,
        otherOwners,
        accountAddress: throwawayClient.account.address,
      });

      const newOwnerAddresses =
        await newOwnerClient.account.getOwnerAddresses();

      expect(sortOwners(newOwnerAddresses)).toEqual(
        sortOwners([signer.address, ...otherOwners.map((o) => o.address)]),
      );
    },
  );

  it("should correctly encode and decode a single call transaction data", async () => {
    const provider = await givenConnectedProvider({ signer, otherOwners });
    const data = [
      {
        to: zeroAddress,
        data: "0xabcd1234" as Hex,
      },
    ] satisfies Call[];

    const encoded = await provider.account.encodeCalls(data);

    expect(encoded).toEqual(
      "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004abcd123400000000000000000000000000000000000000000000000000000000",
    );

    expect(provider.account.decodeCalls).toBeDefined();

    const decoded = await provider.account.decodeCalls!(encoded);

    expect(decoded.length).toEqual(data.length);
    expect(decoded[0].to.toLowerCase()).toEqual(data[0].to.toLowerCase());
    expect(decoded[0].value).toBe(0n);
    expect(decoded[0].data?.toLowerCase()).toEqual(data[0].data?.toLowerCase());
  });

  it("should correctly encode and decode a single call transaction with value", async () => {
    const provider = await givenConnectedProvider({ signer, otherOwners });
    const data = [
      {
        to: zeroAddress,
        data: "0xabcd1234" as Hex,
        value: parseEther("1"),
      },
    ] satisfies Call[];

    const encoded = await provider.account.encodeCalls(data);

    expect(encoded).toEqual(
      "0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004abcd123400000000000000000000000000000000000000000000000000000000",
    );

    expect(provider.account.decodeCalls).toBeDefined();

    const decoded = await provider.account.decodeCalls!(encoded);

    expect(decoded.length).toEqual(data.length);
    expect(decoded[0].to.toLowerCase()).toEqual(data[0].to.toLowerCase());
    expect(decoded[0].value).toBe(parseEther("1"));
    expect(decoded[0].data?.toLowerCase()).toEqual(data[0].data?.toLowerCase());
  });

  it("should correctly encode and decode a batch call transaction data", async () => {
    const provider = await givenConnectedProvider({ signer, otherOwners });
    const data = [
      {
        to: zeroAddress,
        data: "0xabcd1234" as Hex,
      },
      {
        to: zeroAddress,
        value: parseEther("1"),
        data: "0x1234abcd" as Hex,
      },
    ] satisfies Call[];

    const encoded = await provider.account.encodeCalls(data);

    expect(encoded).toBe(
      "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004abcd12340000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041234abcd00000000000000000000000000000000000000000000000000000000",
    );

    expect(provider.account.decodeCalls).toBeDefined();

    const decoded = await provider.account.decodeCalls!(encoded);

    expect(decoded.length).toEqual(data.length);
    expect(decoded[0].to.toLowerCase()).toEqual(data[0].to.toLowerCase());
    expect(decoded[0].value).toBe(0n);
    expect(decoded[0].data?.toLowerCase()).toEqual(data[0].data?.toLowerCase());
    expect(decoded[1].to.toLowerCase()).toEqual(data[1].to.toLowerCase());
    expect(decoded[1].value).toBe(parseEther("1"));
    expect(decoded[1].data?.toLowerCase()).toEqual(data[1].data?.toLowerCase());
  });

  it(
    "should expose prepare and format functions that work correctly",
    { retry: 3, timeout: 30_000 },
    async () => {
      const provider = await givenConnectedProvider({ signer, otherOwners });

      const message = "hello world";

      const { type, data } = await provider.account.prepareSignature({
        type: "personal_sign",
        data: message,
      });

      const ownerSig = await (type === "personal_sign"
        ? signer.signMessage({ message: data })
        : signer.signTypedData(data));

      // Viem's AA stack automatically serializes 6492 signatures whenever `SmartContractAccount.signMessage` is called,
      // so we need to do that check separately when using prepare/format sign.
      const [formattedSig, { factory, factoryData }] = await Promise.all([
        provider.account.formatSignature(ownerSig),
        provider.account.getFactoryArgs(),
      ]);

      const signature =
        factory && factoryData
          ? serializeErc6492Signature({
              address: factory,
              data: factoryData,
              signature: formattedSig,
            })
          : formattedSig;

      const isValid = await client.verifyMessage({
        address: provider.account.address,
        message,
        signature,
      });
      expect(isValid).toBe(true);
    },
  );

  const givenConnectedProvider = async ({
    signer,
    otherOwners,
    salt,
    accountAddress,
    paymaster,
    factoryAddress,
    factoryData,
  }: {
    signer: LocalAccount;
    otherOwners?: OneOf<JsonRpcAccount | LocalAccount>[];
    salt?: bigint;
    accountAddress?: Address;
    paymaster?: boolean;
    factoryAddress?: Address;
    factoryData?: Hex;
  }) => {
    const account = await toMultiOwnerModularAccountV1({
      client: createPublicClient({
        transport: custom(localInstance.getClient()),
        chain: localInstance.chain,
      }),
      owners: [signer, ...(otherOwners || [])],
      factory: factoryAddress,
      accountAddress,
      ...(factoryData ? { factoryData } : { salt }),
    });

    return createBundlerClient({
      account,
      transport: custom(localInstance.getClient()),
      chain: localInstance.chain,
      paymaster: paymaster
        ? createPaymasterClient({
            transport: custom(localInstance.getClient()),
          })
        : undefined,
      paymasterContext: paymaster ? { policyId: "test-policy" } : undefined,
      userOperation: {
        estimateFeesPerGas,
      },
    }).extend(multiOwnerModularAccountV1Actions);
  };

  const sortOwners = (owners: Address[] | readonly Address[]): Address[] =>
    Array.from(owners).sort((a, b) => {
      const bigintA = hexToBigInt(a);
      const bigintB = hexToBigInt(b);
      return bigintA < bigintB ? -1 : bigintA > bigintB ? 1 : 0;
    });
});
