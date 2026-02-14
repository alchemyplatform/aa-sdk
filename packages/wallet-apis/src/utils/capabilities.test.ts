import type { InnerWalletApiClient } from "../types.js";
import {
  mergeClientCapabilities,
  extractCapabilitiesForSending,
  type PrepareCallsCapabilities,
} from "./capabilities.js";

describe("mergeClientCapabilities", () => {
  const createMockClient = (
    policyIds?: string[],
  ): Pick<InnerWalletApiClient, "policyIds"> => ({
    policyIds,
  });

  it("returns capabilities unchanged when client has no policyIds", () => {
    const client = createMockClient(undefined);
    const capabilities: PrepareCallsCapabilities = {
      permissions: { context: "0x1234" },
    };

    const result = mergeClientCapabilities(
      client as InnerWalletApiClient,
      capabilities,
    );

    expect(result).toBe(capabilities);
  });

  it("returns capabilities unchanged when client has empty policyIds", () => {
    const client = createMockClient([]);
    const capabilities: PrepareCallsCapabilities = {
      permissions: { context: "0x1234" },
    };

    const result = mergeClientCapabilities(
      client as InnerWalletApiClient,
      capabilities,
    );

    expect(result).toBe(capabilities);
  });

  it("returns capabilities unchanged when capabilities already has paymaster", () => {
    const client = createMockClient(["policy-1", "policy-2"]);
    const capabilities: PrepareCallsCapabilities = {
      paymaster: { policyId: "existing-policy" },
    };

    const result = mergeClientCapabilities(
      client as InnerWalletApiClient,
      capabilities,
    );

    expect(result).toBe(capabilities);
  });

  it("uses policyId (singular) when client has 1 policyId", () => {
    const client = createMockClient(["single-policy"]);
    const capabilities: PrepareCallsCapabilities = {
      permissions: { context: "0x1234" },
    };

    const result = mergeClientCapabilities(
      client as InnerWalletApiClient,
      capabilities,
    );

    expect(result).toEqual({
      permissions: { context: "0x1234" },
      paymaster: { policyId: "single-policy" },
    });
  });

  it("uses policyIds (array) when client has multiple policyIds", () => {
    const client = createMockClient(["policy-1", "policy-2"]);
    const capabilities: PrepareCallsCapabilities = {
      permissions: { context: "0x1234" },
    };

    const result = mergeClientCapabilities(
      client as InnerWalletApiClient,
      capabilities,
    );

    expect(result).toEqual({
      permissions: { context: "0x1234" },
      paymaster: { policyIds: ["policy-1", "policy-2"] },
    });
  });

  it("adds paymaster when client has single policyId and capabilities is undefined", () => {
    const client = createMockClient(["single-policy"]);

    const result = mergeClientCapabilities(
      client as InnerWalletApiClient,
      undefined,
    );

    expect(result).toEqual({
      paymaster: { policyId: "single-policy" },
    });
  });

  it("returns undefined when both client has no policyIds and capabilities is undefined", () => {
    const client = createMockClient(undefined);

    const result = mergeClientCapabilities(
      client as InnerWalletApiClient,
      undefined,
    );

    expect(result).toBeUndefined();
  });
});

describe("extractCapabilitiesForSending", () => {
  it("returns undefined when capabilities is undefined", () => {
    const result = extractCapabilitiesForSending(undefined);

    expect(result).toBeUndefined();
  });

  it("returns undefined when capabilities has no permissions or paymaster", () => {
    const capabilities: PrepareCallsCapabilities = {
      gasParamsOverride: { callGasLimit: "0x5208" },
    };

    const result = extractCapabilitiesForSending(capabilities);

    expect(result).toBeUndefined();
  });

  it("extracts permissions only", () => {
    const capabilities: PrepareCallsCapabilities = {
      permissions: { context: "0x1234" },
    };

    const result = extractCapabilitiesForSending(capabilities);

    expect(result).toEqual({
      permissions: { context: "0x1234" },
      paymaster: undefined,
    });
  });

  it("extracts paymaster with policyId (already singular)", () => {
    const capabilities: PrepareCallsCapabilities = {
      paymaster: { policyId: "my-policy" },
    };

    const result = extractCapabilitiesForSending(capabilities);

    expect(result).toEqual({
      permissions: undefined,
      paymaster: {
        policyId: "my-policy",
        webhookData: undefined,
      },
    });
  });

  it("passes through policyIds when present", () => {
    const capabilities: PrepareCallsCapabilities = {
      paymaster: { policyIds: ["policy-1", "policy-2", "policy-3"] },
    };

    const result = extractCapabilitiesForSending(capabilities);

    expect(result).toEqual({
      permissions: undefined,
      paymaster: {
        policyIds: ["policy-1", "policy-2", "policy-3"],
        webhookData: undefined,
      },
    });
  });

  it("includes webhookData when present", () => {
    const capabilities: PrepareCallsCapabilities = {
      paymaster: {
        policyId: "my-policy",
        webhookData: "webhook-data-123",
      },
    };

    const result = extractCapabilitiesForSending(capabilities);

    expect(result).toEqual({
      permissions: undefined,
      paymaster: {
        policyId: "my-policy",
        webhookData: "webhook-data-123",
      },
    });
  });

  it("extracts both permissions and paymaster", () => {
    const capabilities: PrepareCallsCapabilities = {
      permissions: { context: "0xabcd" },
      paymaster: {
        policyId: "my-policy",
        webhookData: "some-data",
      },
      gasParamsOverride: { callGasLimit: "0x5208" },
      eip7702Auth: true,
    };

    const result = extractCapabilitiesForSending(capabilities);

    expect(result).toEqual({
      permissions: { context: "0xabcd" },
      paymaster: {
        policyId: "my-policy",
        webhookData: "some-data",
      },
    });
  });

  it("does not include extra fields from paymaster", () => {
    const capabilities: PrepareCallsCapabilities = {
      paymaster: {
        policyId: "my-policy",
        onlyEstimation: true,
        erc20: {
          tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        },
      },
    };

    const result = extractCapabilitiesForSending(capabilities);

    expect(result).toEqual({
      permissions: undefined,
      paymaster: {
        policyId: "my-policy",
        webhookData: undefined,
      },
    });
  });
});
