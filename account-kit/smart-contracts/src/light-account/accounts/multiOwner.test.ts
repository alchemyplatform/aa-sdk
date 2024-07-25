import {
  erc7677Middleware,
  LocalAccountSigner,
  type Address,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { custom, parseEther } from "viem";
import { mine, setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import { local070Instance } from "~test/instances.js";
import { createMultiOwnerLightAccountClient } from "../clients/multiOwnerLightAccount.js";
import type { LightAccountVersion } from "../types";

describe("MultiOwner Light Account Tests", () => {
  const instance = local070Instance;
  let client: ReturnType<typeof instance.getClient>;

  beforeAll(async () => {
    client = instance.getClient();
  });

  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

  it("should successfully get counterfactual address", async () => {
    const provider = await givenConnectedProvider({ signer });
    expect(provider.getAddress()).toMatchInlineSnapshot(
      '"0x6ef8bb149c4422a33f87eF6A406B601D8F964b65"'
    );
  });

  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({ signer });

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("1"),
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  });

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = await givenConnectedProvider({
      signer,
      accountAddress,
    });

    const result = provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    await expect(result).rejects.toThrowError();
  });

  it("should successfully execute with paymaster", async () => {
    await mine(client, { blocks: 2 });

    const provider = await givenConnectedProvider({
      signer,
      usePaymaster: true,
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 5_000);

  const givenConnectedProvider = ({
    signer,
    version = "v2.0.0",
    accountAddress,
    usePaymaster = false,
  }: {
    signer: SmartAccountSigner;
    version?: LightAccountVersion<"MultiOwnerLightAccount">;
    usePaymaster?: boolean;
    accountAddress?: Address;
  }) =>
    createMultiOwnerLightAccountClient({
      account: {
        signer,
        accountAddress,
        version,
      },
      transport: custom(client),
      chain: instance.chain,
      customMiddleware: async (uo) => {
        console.log(uo);
        return uo;
      },
      ...(usePaymaster ? erc7677Middleware() : {}),
    });
});
