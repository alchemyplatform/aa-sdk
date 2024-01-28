import { createRundler, type Rundler } from "@alchemy/rundler-js";
import {
  createPublicClient,
  custom,
  http,
  testActions,
  type Chain,
} from "viem";
import { describe, it } from "vitest";
import { sepolia } from "../../chains/index.js";
import { createBundlerClientFromExisting } from "../../client/bundlerClient.js";
import { createSmartAccountClientFromExisting } from "../../client/smartAccountClient.js";
import { LocalAccountSigner } from "../../signer/local-account.js";
import { type SmartAccountSigner } from "../../signer/types.js";
import type { BatchUserOperationCallData } from "../../types.js";
import { getDefaultSimpleAccountFactoryAddress } from "../../utils/index.js";
import { createSimpleSmartAccount } from "../simple.js";
import { split } from "../../transport/split.js";

describe("Account Simple Tests", async () => {
  const chain = sepolia;
  const dummyMnemonic =
    "test test test test test test test test test test test test";
  const signer: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);
  let rundler: Rundler;
  const publicClientGenerator = () =>
    createBundlerClientFromExisting(
      createPublicClient({
        chain,
        transport: split({
          overrides: [
            {
              methods: [
                "eth_sendUserOperation",
                "eth_estimateUserOperationGas",
                "eth_getUserOperationReceipt",
                "eth_getUserOperationByHash",
                "eth_supportedEntryPoints",
              ],
              transport: http(`http://${rundler.host}:${rundler.port}`),
            },
          ],
          fallback: http(`http://${rundler.anvil.host}:${rundler.anvil.port}`),
        }),
      })
    ).extend(testActions({ mode: "anvil" }));

  let publicClient: ReturnType<typeof publicClientGenerator>;

  beforeAll(async () => {
    rundler = await createRundler({
      anvilOptions: {
        forkUrl: "https://ethereum-sepolia.publicnode.com",
        chainId: chain.id,
        startTimeout: 20_000,
      },
      rundlerOptions: {},
    });

    publicClient = publicClientGenerator();
    publicClient.setAutomine(true);

    await rundler.start();
  }, 30000);

  afterEach(async (context) => {
    context.onTestFailed(async () => {
      // Only print the 20 most recent log messages.
      console.log(...rundler.anvil.logs.slice(-20));
      console.log(...rundler.logs.slice(-20));
    });
  });

  afterAll(async () => {
    await rundler.stop();
  });

  it("should correctly sign the message", async () => {
    const provider = await givenConnectedProvider({ signer, chain });
    expect(
      await provider.account.signMessage({
        message: {
          raw: "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b",
        },
      })
    ).toBe(
      "0x33b1b0d34ba3252cd8abac8147dc08a6e14a6319462456a34468dd5713e38dda3a43988460011af94b30fa3efefcf9d0da7d7522e06b7bd8bff3b65be4aee5b31c"
    );
  }, 30000);

  it("should correctly encode batch transaction data", async () => {
    const provider = await givenConnectedProvider({ signer, chain });
    const data = [
      {
        target: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        data: "0xdeadbeef",
      },
      {
        target: "0x8ba1f109551bd432803012645ac136ddd64dba72",
        data: "0xcafebabe",
      },
    ] satisfies BatchUserOperationCallData;

    expect(
      await provider.account.encodeBatchExecute(data)
    ).toMatchInlineSnapshot(
      '"0x18dfb3c7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"'
    );
  });

  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({ signer, chain });
    await publicClient.setBalance({
      address: provider.account.address,
      value: 100000000000000000000n,
    });

    await expect(
      provider.sendUserOperation({
        uo: {
          target: provider.account.address,
          data: "0x",
          value: 0n,
        },
      })
    ).resolves.not.toThrowError();
  }, 10000);

  it("should correctly use the account init code override", async () => {
    const account = await createSimpleSmartAccount({
      chain: sepolia,
      signer,
      factoryAddress: getDefaultSimpleAccountFactoryAddress(sepolia),
      transport: custom(publicClient),
      // override the account address here so we don't have to resolve the address from the entry point
      accountAddress: "0x1234567890123456789012345678901234567890",
      initCode: "0xdeadbeef",
    });

    const initCode = await account.getInitCode();
    expect(initCode).toMatchInlineSnapshot('"0xdeadbeef"');
  });

  const givenConnectedProvider = async ({
    signer,
    chain,
  }: {
    signer: SmartAccountSigner;
    chain: Chain;
  }) =>
    createSmartAccountClientFromExisting({
      client: publicClient,
      account: await createSimpleSmartAccount({
        chain,
        signer,
        factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
        transport: custom(publicClient),
      }),
      opts: {
        feeOptions: {
          maxFeePerGas: { multiplier: 4 },
          maxPriorityFeePerGas: { multiplier: 4 },
        },
      },
    });
});
