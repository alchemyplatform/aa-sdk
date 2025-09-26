import { local060Instance, local070Instance } from "~test/instances.js";
import { toLightAccount } from "@alchemy/smart-accounts";
import { requestGasAndPaymasterAndData } from "./requestGasAndPaymasterAndData.js";
import type { AlchemyTransport } from "@alchemy/common";
import {
  createWalletClient,
  custom,
  zeroAddress,
  concat,
  type Client,
} from "viem";
import {
  entryPoint06Address,
  entryPoint07Address,
} from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

describe("requestGasAndPaymasterAndData tests", async () => {
  it("should be able to call requestGasAndPaymasterAndData with v0.6 user operation", async () => {
    const client = local060Instance.getClient();
    const signer = privateKeyToAccount(generatePrivateKey());

    const smartAccount = await toLightAccount({
      client: createWalletClient({
        account: signer,
        transport: custom(client.transport),
        chain: client.chain,
      }),
      version: "v1.1.0",
      owner: signer,
    });

    const factoryArgs = await smartAccount.getFactoryArgs();
    const { factory, factoryData } = factoryArgs;
    const v06UserOperation = {
      sender: smartAccount.address,
      nonce: 0n,
      initCode:
        factory && factoryData ? concat([factory, factoryData]) : undefined,
      callData: await smartAccount.encodeCalls([
        {
          to: zeroAddress,
          data: "0x" as const,
        },
      ]),
    };

    const result = await requestGasAndPaymasterAndData(
      client as unknown as Client<AlchemyTransport>,
      [
        {
          policyId: "test-policy-id",
          entryPoint: entryPoint06Address,
          dummySignature: await smartAccount.getStubSignature(),
          userOperation: v06UserOperation,
        },
      ],
    );

    expect(result).toBeDefined();
    expect(result).toHaveProperty("callGasLimit");
    expect(result).toHaveProperty("preVerificationGas");
    expect(result).toHaveProperty("verificationGasLimit");
    expect(result).toHaveProperty("maxFeePerGas");
    expect(result).toHaveProperty("maxPriorityFeePerGas");
    expect(result).toHaveProperty("paymasterAndData");
  });

  it("should be able to call requestGasAndPaymasterAndData with v0.7 user operation", async () => {
    const client = local070Instance.getClient();
    const signer = privateKeyToAccount(generatePrivateKey());

    const smartAccount = await toLightAccount({
      client: createWalletClient({
        account: signer,
        transport: custom(client.transport),
        chain: client.chain,
      }),
      version: "v2.0.0",
      owner: signer,
    });

    const factoryArgs = await smartAccount.getFactoryArgs();
    const v07UserOperation = {
      sender: smartAccount.address,
      nonce: 0n,
      factory: factoryArgs.factory,
      factoryData: factoryArgs.factoryData,
      callData: await smartAccount.encodeCalls([
        {
          to: zeroAddress,
          data: "0x" as const,
        },
      ]),
      signature: await smartAccount.getStubSignature(),
    };

    const result = await requestGasAndPaymasterAndData(
      client as unknown as Client<AlchemyTransport>,
      [
        {
          policyId: "test-policy-id",
          entryPoint: entryPoint07Address,
          dummySignature: await smartAccount.getStubSignature(),
          userOperation: v07UserOperation,
        },
      ],
    );

    expect(result).toBeDefined();
    expect(result).toHaveProperty("callGasLimit");
    expect(result).toHaveProperty("preVerificationGas");
    expect(result).toHaveProperty("verificationGasLimit");
    expect(result).toHaveProperty("maxFeePerGas");
    expect(result).toHaveProperty("maxPriorityFeePerGas");
    expect(result).toHaveProperty("paymaster");
    expect(result).toHaveProperty("paymasterData");
    expect(result).toHaveProperty("paymasterVerificationGasLimit");
    expect(result).toHaveProperty("paymasterPostOpGasLimit");
  });

  // todo(v5): test using ERC-20 context, and test using state overrides (when supported)
});
