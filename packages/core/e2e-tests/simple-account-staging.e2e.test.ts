import {
  custom,
  fromHex,
  http,
  isAddress,
  type Address,
  type Chain,
  type Hex,
} from "viem";
import { generatePrivateKey } from "viem/accounts";
import {
  arbitrumSepolia,
  createBundlerClient,
  createSimpleSmartAccount,
  createSmartAccountClientFromExisting,
  getEntryPoint,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
  type UserOperationOverrides,
} from "../src/index.js";
import { LocalAccountSigner } from "../src/signer/local-account.js";
import { API_KEY, API_KEY_STAGING, OWNER_MNEMONIC } from "./constants.js";

const rpcUrl = "https://arb-sepolia.g.alchemypreview.com/v2";
const chain = arbitrumSepolia;

describe("Simple Account Tests on Split RPC", () => {
  const signer: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC);

  it("should successfully get counterfactual address", async () => {
    const client = await givenConnectedClient({ signer, chain });
    expect(client.getAddress()).toMatchInlineSnapshot(
      `"0x439663CEb3861f1bCf7F45F1792668fC74fc4b97"`
    );
  });

  it("should execute successfully", async () => {
    const client = await givenConnectedClient({ signer, chain });
    const result = await client.sendUserOperation({
      uo: {
        target: client.getAddress(),
        data: "0x",
      },
    });

    const txnHash = client.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 60000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const client = await givenConnectedClient({
      signer,
      chain,
      accountAddress,
    });

    const result = client.sendUserOperation({
      uo: {
        target: client.getAddress(),
        data: "0x",
      },
    });

    await expect(result).rejects.toThrowError();
  });

  it("should get counterfactual for undeployed account", async () => {
    const signer = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const client = await givenConnectedClient({ signer, chain });

    const address = client.getAddress();
    expect(isAddress(address)).toBe(true);
  });

  it("should correctly handle multiplier overrides for buildUserOperation", async () => {
    const client = await givenConnectedClient({
      signer,
      chain,
    });

    const structPromise = client.buildUserOperation({
      uo: {
        target: client.getAddress(),
        data: "0x",
      },
    });

    await expect(structPromise).resolves.not.toThrowError();

    const clientWithFeeOptions = await givenConnectedClient({
      signer,
      chain,
      feeOptions: {
        preVerificationGas: { multiplier: 2 },
      },
    });

    const structWithFeeOptionsPromise = clientWithFeeOptions.buildUserOperation(
      {
        uo: {
          target: client.getAddress(),
          data: "0x",
        },
      }
    );
    await expect(structWithFeeOptionsPromise).resolves.not.toThrowError();

    const [struct, structWithFeeOptions] = await Promise.all([
      structPromise,
      structWithFeeOptionsPromise,
    ]);

    const preVerificationGas =
      typeof struct.preVerificationGas === "string"
        ? fromHex(struct.preVerificationGas as Hex, "bigint")
        : struct.preVerificationGas;
    const preVerificationGasWithFeeOptions =
      typeof structWithFeeOptions.preVerificationGas === "string"
        ? fromHex(structWithFeeOptions.preVerificationGas as Hex, "bigint")
        : structWithFeeOptions.preVerificationGas;

    expect(preVerificationGasWithFeeOptions).toBeGreaterThan(
      preVerificationGas!
    );
  }, 60000);

  it("should correctly handle absolute overrides for sendUserOperation", async () => {
    const client = await givenConnectedClient({ signer, chain });

    const overrides: UserOperationOverrides<"0.6.0"> = {
      preVerificationGas: 100_000_000n,
    };
    const promise = client.buildUserOperation({
      uo: {
        target: client.getAddress(),
        data: "0x",
      },
      overrides,
    });
    await expect(promise).resolves.not.toThrowError();

    const struct = await promise;
    expect(struct.preVerificationGas).toBe(100_000_000n);
  }, 60000);

  it("should correctly handle multiplier overrides for sendUserOperation", async () => {
    const client = await givenConnectedClient({
      signer,
      chain,
      feeOptions: {
        preVerificationGas: { multiplier: 2 },
      },
    });

    const struct = client.sendUserOperation({
      uo: {
        target: client.getAddress(),
        data: "0x",
      },
    });
    await expect(struct).resolves.not.toThrowError();
  }, 60000);
});

const givenConnectedClient = async ({
  signer,
  chain,
  accountAddress,
  feeOptions,
}: {
  signer: SmartAccountSigner;
  chain: Chain;
  accountAddress?: Address;
  feeOptions?: UserOperationFeeOptions;
}) => {
  const client = createBundlerClient({
    chain,
    transport: (opts) => {
      const bundlerRpc = http(`${rpcUrl}/${API_KEY_STAGING}`)(opts);
      const publicRpc = http(`${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`)(
        opts
      );

      return custom({
        request: async (args) => {
          const bundlerMethods = new Set([
            "eth_sendUserOperation",
            "eth_estimateUserOperationGas",
            "eth_getUserOperationReceipt",
            "eth_getUserOperationByHash",
            "eth_supportedEntryPoints",
          ]);

          if (bundlerMethods.has(args.method)) {
            return bundlerRpc.request(args);
          } else {
            return publicRpc.request(args);
          }
        },
      })(opts);
    },
  });
  return createSmartAccountClientFromExisting({
    client,
    account: await createSimpleSmartAccount({
      chain,
      signer,
      entryPoint: getEntryPoint(chain),
      transport: custom(client),
      accountAddress,
    }),
    feeEstimator: async (struct) => ({
      ...struct,
      maxFeePerGas: 100_000_000_000n,
      maxPriorityFeePerGas: 100_000_000_000n,
    }),
    opts: { feeOptions },
  });
};
