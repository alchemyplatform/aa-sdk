import { isAddressEqual, zeroAddress } from "viem";
import { lowerAddress } from "@alchemy/common";
import {
  DEFAULT_SMAV2_7702_VERSION,
  ModularAccountV2VersionRegistry,
} from "./registry.js";
import { semiModularAccount7702StaticImpl } from "./mav2StaticImpl.js";
import { DefaultAddress } from "./utils/account.js";

describe("ModularAccountV2VersionRegistry", () => {
  const smav2_7702 = ModularAccountV2VersionRegistry.SemiModularAccount7702;

  it("gives every 7702 version a distinct delegation address", () => {
    const addresses = Object.values(smav2_7702).map(
      (impl) => impl.delegationAddress,
    );

    expect(new Set(addresses).size).toBe(addresses.length);
  });

  it("keeps 7702 delegation addresses lowercased", () => {
    // Matches every other static impl in the package, and `authorization.address`
    // is read straight off these, so the casing consumers see is what's stored.
    for (const [version, impl] of Object.entries(smav2_7702)) {
      expect(impl.delegationAddress, `${version} is not lowercased`).toBe(
        lowerAddress(impl.delegationAddress),
      );
    }
  });

  it("gives each account type the address field for its eip7702 shape", () => {
    for (const impl of Object.values(smav2_7702)) {
      expect(impl).toHaveProperty("delegationAddress");
      expect(impl).not.toHaveProperty("accountImplementation");
    }

    const smaB =
      ModularAccountV2VersionRegistry.SemiModularAccountBytecode["v1.0.0"];
    expect(smaB).toHaveProperty("accountImplementation");
    expect(smaB).not.toHaveProperty("delegationAddress");
  });

  it("points `semiModularAccount7702StaticImpl` at the default version", () => {
    expect(semiModularAccount7702StaticImpl).toBe(
      smav2_7702[DEFAULT_SMAV2_7702_VERSION],
    );
  });

  it("keeps `DefaultAddress.SMAV2_7702` in sync with the default version", () => {
    // Case-insensitive: `DefaultAddress` is checksummed, the registry is not.
    expect(
      isAddressEqual(
        smav2_7702[DEFAULT_SMAV2_7702_VERSION].delegationAddress,
        DefaultAddress.SMAV2_7702,
      ),
    ).toBe(true);
  });

  it("registers no placeholder addresses", () => {
    // Registered versions must provide a concrete delegation address.
    for (const [version, impl] of Object.entries(smav2_7702)) {
      expect(
        isAddressEqual(impl.delegationAddress, zeroAddress),
        `${version} has a placeholder address`,
      ).toBe(false);
    }
  });
});
