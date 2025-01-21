import {
  erc7677Middleware,
  LocalAccountSigner,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { custom } from "viem";
import { createSMAV2AccountClient } from "@account-kit/smart-contracts/experimental";
import { local070Instance } from "~test/instances.js";
import { accounts } from "~test/constants.js";
import { alchemy } from "@account-kit/infra";

// TODO: Include a snapshot to reset to in afterEach.
describe("MA v2 Tests: Types", async () => {
  const instance = local070Instance;

  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

  it("alchemy client instantiated can specify policy id but not for others ", async () => {
    createSMAV2AccountClient({
      chain: instance.chain,
      signer,
      transport: alchemy({ apiKey: "AN_API_KEY" }),
      policyId: "test-policy-id",
    });
    // @ts-expect-error // A custom should not be able to specify an policy id
    createSMAV2AccountClient({
      chain: instance.chain,
      signer,
      transport: custom(instance.getClient()),
      policyId: "test-policy-id",
    });
  });

  it("alchemy client instantiated cannot specify paymaster", async () => {
    const { paymasterAndData } = erc7677Middleware();
    createSMAV2AccountClient({
      chain: instance.chain,
      signer,
      transport: alchemy({ apiKey: "AN_API_KEY" }),
    });
    // @ts-expect-error Should not be able to pass paymasterAndData
    createSMAV2AccountClient({
      chain: instance.chain,
      signer,
      transport: alchemy({ apiKey: "AN_API_KEY" }),
      paymasterAndData,
    });
    createSMAV2AccountClient({
      chain: instance.chain,
      signer,
      transport: custom(instance.getClient()),
    });
    createSMAV2AccountClient({
      chain: instance.chain,
      signer,
      transport: custom(instance.getClient()),
      paymasterAndData,
    });
  });
});
