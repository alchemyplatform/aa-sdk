import { vi } from "vitest";
import { AlchemySignerWebClient } from "../../src/client/index.js";
import type { User } from "../../src/client/types.js";
import type { OtpParams } from "../../src/client/types.js";
import type { AlchemySignerClientEvents } from "../../src/client/types.js";
import type { AuthenticatingEventMetadata } from "../../src/client/types.js";

// Event types for better type safety
type ClientEventMap = {
  connectedEmail: [User, string]; // [user, bundle]
  connected: [User];
  connectedOtp: [User, string]; // [user, bundle]
};

/**
 * Mock implementation of AlchemySignerWebClient for testing
 * This class intercepts all network calls and allows tests to control responses
 */
class MockAlchemySignerWebClient extends AlchemySignerWebClient {
  // Mock function definitions
  public mock_initEmailAuth = vi.fn();
  public mock_createAccount = vi.fn();
  public mock_submitOtpCode = vi.fn();
  public mock_completeAuthWithBundle = vi.fn();
  public mock_lookupUserWithPasskey = vi.fn();
  public mock_addMfa = vi.fn();
  public mock_verifyMfa = vi.fn();
  public mock_removeMfa = vi.fn();
  public mock_validateMultiFactors = vi.fn();
  public disconnect = vi.fn();

  // Authentication method overrides
  public override initEmailAuth = async (params: any) => {
    return this.mock_initEmailAuth(params);
  };

  public override createAccount = async (params: any) => {
    return this.mock_createAccount(params);
  };

  public override submitOtpCode = async (
    params: Omit<OtpParams, "targetPublicKey">,
  ) => {
    if ("otpId" in params && "otpCode" in params) {
      const { otpId, otpCode, multiFactors = [] } = params;
      return this.mock_submitOtpCode(otpId, otpCode, multiFactors);
    }
    return this.mock_submitOtpCode(params);
  };

  public override completeAuthWithBundle = async (params: {
    bundle: string;
    orgId: string;
    connectedEventName: keyof AlchemySignerClientEvents;
    authenticatingType: AuthenticatingEventMetadata["type"];
    idToken?: string;
  }) => {
    return this.mock_completeAuthWithBundle(params);
  };

  public override lookupUserWithPasskey = async (params: any) => {
    return this.mock_lookupUserWithPasskey(params);
  };

  // MFA method overrides
  public override addMfa = async (params: any) => {
    return this.mock_addMfa(params);
  };

  public override verifyMfa = async (params: any) => {
    return this.mock_verifyMfa(params);
  };

  public override removeMfa = async (params: any) => {
    return this.mock_removeMfa(params);
  };

  public override getMfaFactors = async () => {
    return { multiFactors: [] };
  };

  public override validateMultiFactors = async (args: {
    encryptedPayload: string;
    multiFactors: Array<{
      multiFactorId: string;
      multiFactorCode: string;
    }>;
  }): Promise<{ bundle: string }> => {
    const result = this.mock_validateMultiFactors(args);
    if (result && typeof result.then === "function") {
      return result.then((mockResult: any) => {
        return { bundle: mockResult?.bundle || "mock-bundle" };
      });
    }
    return { bundle: result?.bundle || "mock-bundle" };
  };

  // Network-related method overrides
  public override lookupUserByEmail = async (email: string) => {
    // Return a mock result so we pretend this user always exists in "mock-org-id"
    return { orgId: "mock-org-id" };
  };

  // Override request() to avoid calling fetch
  public override request = vi
    .fn()
    .mockImplementation(async (route: string, body: any) => {
      // Return mock responses based on the route
      if (route === "/v1/signer-config") {
        return { email: { mode: "otp" } };
      }
      if (route === "/v1/lookup") {
        return { orgId: "mock-org-id" };
      }
      return {};
    }) as any;

  /**
   * Helper to manually emit events from the client's eventEmitter
   * This is used by tests to simulate client-side events
   *
   * @param {K} eventName - The name of the event to emit
   * @param {ClientEventMap[K]} args - The arguments to pass to the event listeners
   */
  public emitClientEvent<K extends keyof ClientEventMap>(
    eventName: K,
    ...args: ClientEventMap[K]
  ): void {
    // Force-cast to call protected eventEmitter
    (this.eventEmitter as any).emit(eventName, ...args);
  }
}

export { MockAlchemySignerWebClient };
