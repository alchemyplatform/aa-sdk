import {
  erc7677Middleware,
  LocalAccountSigner,
  type SmartAccountClient,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import {
  custom,
  type Address,
  type Chain,
  type Client,
  type CustomTransport,
} from "viem";
import { accounts } from "~test/constants.js";
import { local060Instance } from "~test/instances.js";
import type { LightAccountVersion } from "../types.js";
import { createLightAccountClient } from "./client.js";
import {
  alchemy,
  polygonMumbai,
  type AlchemyTransport,
  type AlchemySmartAccountClient,
} from "@account-kit/infra";
import {
  alchemyEnhancedApiActions,
  type AlchemyEnhancedApis,
} from "@account-kit/infra/enhanced-apis";
import { Alchemy, Network } from "alchemy-sdk";

describe("Types: Light Account Tests", () => {
  const instance = local060Instance;
  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner,
  );

  const givenConnectedProvider = ({
    signer,
    version = "v1.1.0",
    accountAddress,
    usePaymaster = false,
  }: {
    signer: SmartAccountSigner;
    version?: LightAccountVersion<"LightAccount">;
    usePaymaster?: boolean;
    accountAddress?: Address;
  }) =>
    createLightAccountClient({
      signer,
      accountAddress,
      version,
      transport: custom(instance.getClient()),
      chain: instance.chain,
      ...(usePaymaster ? erc7677Middleware() : {}),
    });

  const givenAlchemyConnectedProvider = async ({
    signer,
    chain,
  }: {
    signer: SmartAccountSigner;
    chain: Chain;
  }) =>
    createLightAccountClient({
      transport: alchemy({
        jwt: "test",
      }),
      chain,
      signer,
      accountAddress: "0x86f3B0211764971Ad0Fc8C8898d31f5d792faD84",
    });
  it("Should have some alchemy specific types", async () => {
    const alchemy = new Alchemy({
      network: Network.MATIC_MUMBAI,
      apiKey: "test",
    });
    const chain = polygonMumbai;

    const provider = (
      await givenAlchemyConnectedProvider({ signer, chain })
    ).extend(alchemyEnhancedApiActions(alchemy));

    assertType<Client<AlchemyTransport>>(provider);
    assertType<AlchemySmartAccountClient>(provider);
    assertType<SmartAccountClient>(provider);
    assertType<AlchemyEnhancedApis>(provider);
    assertType<AlchemyEnhancedApis>(
      // @ts-expect-error
      await givenAlchemyConnectedProvider({ signer, chain }),
    );
    // @ts-expect-error
    assertType<Client<CustomTransport>>(provider);
  });
  it("Should have some non-alchemy specific types", async () => {
    const chain = polygonMumbai;

    const signer: SmartAccountSigner = new LocalAccountSigner(
      accounts.fundedAccountOwner,
    );
    const provider = await givenConnectedProvider({
      signer,
      version: "v1.0.1",
    });

    assertType<SmartAccountClient>(provider);
    assertType<Client<CustomTransport>>(provider);
    assertType<AlchemyEnhancedApis>(
      // @ts-expect-error
      await givenAlchemyConnectedProvider({ signer, chain }),
    );
    // @ts-expect-error
    assertType<Client<AlchemyTransport>>(provider);
    // @ts-expect-error
    assertType<AlchemySmartAccountClient>(provider);
    // @ts-expect-error
    assertType<AlchemyEnhancedApis>(provider);

    expect(() => {
      const alchemy = new Alchemy({
        network: Network.MATIC_MUMBAI,
        apiKey: "test",
      });

      // @ts-expect-error
      provider.extend(alchemyEnhancedApiActions(alchemy));
    }).not.toBeFalsy();
  });
});
