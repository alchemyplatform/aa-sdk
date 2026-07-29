import { createPublicClient, custom } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { localInstance } from "~test/instances.js";
import { toModularAccountV2 } from "./accounts/account.js";
import {
  semiModularAccount7702StaticImpl,
  semiModularAccount7702StaticImplV1_0_0,
  semiModularAccount7702StaticImplV1_1_0,
  SemiModularAccount7702VersionRegistry,
} from "./mav2StaticImpl.js";
import {
  DEFAULT_SEMI_MODULAR_ACCOUNT_7702_VERSION,
  DefaultAddress,
  SemiModularAccount7702Address,
} from "./utils/account.js";

describe("SemiModularAccount7702 version registry", () => {
  it("registers a static implementation for every known version", () => {
    expect(Object.keys(SemiModularAccount7702VersionRegistry)).toEqual(
      Object.keys(SemiModularAccount7702Address),
    );

    for (const [version, impl] of Object.entries(
      SemiModularAccount7702VersionRegistry,
    )) {
      expect(impl.delegationAddress).toEqual(
        SemiModularAccount7702Address[
          version as keyof typeof SemiModularAccount7702Address
        ].toLowerCase(),
      );
    }
  });

  it("delegates each version to a distinct address", () => {
    expect(
      semiModularAccount7702StaticImplV1_1_0.delegationAddress,
    ).not.toEqual(semiModularAccount7702StaticImplV1_0_0.delegationAddress);
  });

  it("keeps the unversioned exports pinned to the default version", () => {
    expect(semiModularAccount7702StaticImpl).toBe(
      SemiModularAccount7702VersionRegistry[
        DEFAULT_SEMI_MODULAR_ACCOUNT_7702_VERSION
      ],
    );
    expect(DefaultAddress.SMAV2_7702).toEqual(
      SemiModularAccount7702Address[DEFAULT_SEMI_MODULAR_ACCOUNT_7702_VERSION],
    );
  });
});

describe("toModularAccountV2 7702 delegation version", () => {
  const client = createPublicClient({
    chain: localInstance.chain,
    transport: custom(localInstance.getClient()),
  });

  const given7702Account = (version?: "v1.0.0" | "v1.1.0") =>
    toModularAccountV2({
      client,
      owner: privateKeyToAccount(generatePrivateKey()),
      mode: "7702",
      version,
    });

  it("authorizes the default delegation when no version is given", async () => {
    const account = await given7702Account();

    expect(account.authorization?.address).toEqual(DefaultAddress.SMAV2_7702);
  });

  it("authorizes the requested version's delegation", async () => {
    const account = await given7702Account("v1.1.0");

    expect(account.authorization?.address).toEqual(
      SemiModularAccount7702Address["v1.1.0"],
    );
  });
});
