import {
  erc7677Middleware,
  LocalAccountSigner,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { alchemy } from "@account-kit/infra";
import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { custom } from "viem";
import { accounts } from "~test/constants.js";
import { localInstance } from "~test/instances.js";

// TODO: Include a snapshot to reset to in afterEach.
describe("MA v2 Tests: Types", async () => {
  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner,
  );

  it("webauthn client can be instantiated with alchemy transport", async () => {
    await createModularAccountV2Client({
      mode: "webauthn",
      chain: localInstance.chain,
      transport: alchemy({ apiKey: "AN_API_KEY" }),
      credential: {
        id: "test-id",
        publicKey: "0x000",
      },
    });
  });

  it("webauthn client can be instantiated with other transport", async () => {
    await createModularAccountV2Client({
      mode: "webauthn",
      chain: localInstance.chain,
      transport: custom(localInstance.getClient()),
      credential: {
        id: "test-id",
        publicKey: "0x000",
      },
    });
  });

  it("webauthn client cannot be instantied with a signer when using alchemy transport", async () => {
    // @ts-expect-error // Should not be able to pass a signer
    await createModularAccountV2Client({
      mode: "webauthn",
      chain: localInstance.chain,
      signer,
      transport: alchemy({ apiKey: "AN_API_KEY" }),
      credential: {
        id: "test-id",
        publicKey: "0x000",
      },
    });
  });

  it("webauthn client cannot be instantied with a signer when using other transport", async () => {
    await createModularAccountV2Client({
      mode: "webauthn",
      chain: localInstance.chain,
      // @ts-expect-error // Should not be able to pass a signer
      signer,
      transport: custom(localInstance.getClient()),
      credential: {
        id: "test-id",
        publicKey: "0x000",
      },
    });
  });

  it("alchemy client instantiated can specify policy id but not for others ", async () => {
    createModularAccountV2Client({
      chain: localInstance.chain,
      signer,
      transport: alchemy({ apiKey: "AN_API_KEY" }),
      policyId: "test-policy-id",
    });
    // @ts-expect-error // A custom should not be able to specify an policy id
    createModularAccountV2Client({
      chain: localInstance.chain,
      signer,
      transport: custom(localInstance.getClient()),
      policyId: "test-policy-id",
    });
  });

  it("alchemy client instantiated cannot specify paymaster", async () => {
    const { paymasterAndData } = erc7677Middleware();
    createModularAccountV2Client({
      chain: localInstance.chain,
      signer,
      transport: alchemy({ apiKey: "AN_API_KEY" }),
    });
    // @ts-expect-error Should not be able to pass paymasterAndData
    createModularAccountV2Client({
      chain: localInstance.chain,
      signer,
      transport: alchemy({ apiKey: "AN_API_KEY" }),
      paymasterAndData,
    });
    createModularAccountV2Client({
      chain: localInstance.chain,
      signer,
      transport: custom(localInstance.getClient()),
    });
    createModularAccountV2Client({
      chain: localInstance.chain,
      signer,
      transport: custom(localInstance.getClient()),
      paymasterAndData,
    });
  });
});
