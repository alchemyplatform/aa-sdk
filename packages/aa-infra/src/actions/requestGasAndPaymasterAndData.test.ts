import { local060Instance, local070Instance } from "~test/instances.js";
import { createLightAccount } from "@account-kit/smart-contracts";
import { requestGasAndPaymasterAndData } from "./requestGasAndPaymasterAndData.js";
import type { AlchemyTransport } from "@alchemy/common";
import { http, zeroAddress, type Client } from "viem";
import {
  entryPoint06Address,
  entryPoint07Address,
} from "viem/account-abstraction";
import { generatePrivateKey } from "viem/accounts";
import { sepolia } from "viem/chains";
import { LocalAccountSigner } from "@aa-sdk/core";

// todo(v5): migrate to using `@alchemy/smart-account` definitions of light account, rather than `@account-kit/smart-contracts`
describe("requestGasAndPaymasterAndData tests", async () => {
  it("should be able to call requestGasAndPaymasterAndData with v0.6 user operation", async () => {
    const client = local060Instance.getClient();

    const smartAccount = await createLightAccount({
      chain: sepolia,
      transport: http(),
      version: "v1.1.0",
      signer:
        LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
    });

    const v06UserOperation = {
      sender: smartAccount.address,
      nonce: 0n,
      initCode: await smartAccount.getInitCode(),
      callData: await smartAccount.encodeBatchExecute([
        {
          target: zeroAddress,
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
          dummySignature: await smartAccount.getDummySignature(),
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

    const smartAccount = await createLightAccount({
      chain: sepolia,
      transport: http(),
      version: "v2.0.0",
      signer:
        LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
    });

    const v07UserOperation = {
      sender: smartAccount.address,
      nonce: 0n,
      factory: await smartAccount.getFactoryAddress(),
      factoryData: await smartAccount.getFactoryData(),
      callData: await smartAccount.encodeBatchExecute([
        {
          target: zeroAddress,
          data: "0x" as const,
        },
      ]),
      signature: await smartAccount.getDummySignature(),
    };

    const result = await requestGasAndPaymasterAndData(
      client as unknown as Client<AlchemyTransport>,
      [
        {
          policyId: "test-policy-id",
          entryPoint: entryPoint07Address,
          dummySignature: await smartAccount.getDummySignature(),
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
