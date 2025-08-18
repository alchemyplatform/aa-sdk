import { arbitrumSepolia } from "@account-kit/infra";
import { createSmartWalletClient } from "./client.js";
import { alchemy } from "@alchemy/common";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { assertType } from "vitest";

describe("Types: Smart Wallet Client Tests", () => {
  const transport = alchemy({ apiKey: "fake" });
  const signer = privateKeyToAccount(generatePrivateKey());
  const chain = arbitrumSepolia;

  it("Requires account address for requests if instantiated without an address", async () => {
    const client = createSmartWalletClient({
      transport,
      chain,
      signer,
    });

    assertType<Parameters<typeof client.prepareCalls>[0]>({
      from: "0x123",
      calls: [],
    });

    assertType<Parameters<typeof client.sendCalls>[0]>({
      from: "0x123",
      calls: [],
    });

    assertType<Parameters<typeof client.grantPermissions>[0]>({
      account: "0x123",
      permissions: [{ type: "root" }],
      key: {
        publicKey: "0x123",
        type: "secp256k1",
      },
    });
  });

  it("Doesn't allow an address for requests if instantiated with an address", async () => {
    const client = createSmartWalletClient({
      transport,
      chain,
      signer,
      account: "0x123",
    });

    assertType<Parameters<typeof client.prepareCalls>[0]>({
      calls: [],
    });

    assertType<Parameters<typeof client.sendCalls>[0]>({
      calls: [],
    });

    assertType<Parameters<typeof client.grantPermissions>[0]>({
      permissions: [{ type: "root" }],
      key: {
        publicKey: "0x123",
        type: "secp256k1",
      },
    });

    assertType<Parameters<typeof client.prepareCalls>[0]>({
      // @ts-expect-error - from should not be accepted when account is hoisted.
      from: "0x456",
      calls: [],
    });

    assertType<Parameters<typeof client.sendCalls>[0]>({
      // @ts-expect-error - from should not be accepted when account is hoisted.
      from: "0x456",
      calls: [],
    });

    assertType<Parameters<typeof client.grantPermissions>[0]>({
      // @ts-expect-error - account should not be accepted when account is hoisted.
      account: "0x456",
      permissions: [{ type: "root" }],
      key: {
        publicKey: "0x123",
        type: "secp256k1",
      },
    });
  });
});
