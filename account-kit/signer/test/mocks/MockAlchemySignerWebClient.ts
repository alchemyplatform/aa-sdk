import { vi } from "vitest";
import { AlchemySignerWebClient } from "../../src/client/index.js";
import type { User } from "../../src/client/types.js";

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

  // Override methods using arrow functions
  public override initEmailAuth = async (...args: any) => {
    return this.mock_initEmailAuth(...args);
  };
  public override createAccount = async (...args: any) => {
    return this.mock_createAccount(...args);
  };
  public override submitOtpCode = async (...args: any) => {
    return this.mock_submitOtpCode(...args);
  };
  public override completeAuthWithBundle = async (...args: any) => {
    return this.mock_completeAuthWithBundle(...args);
  };
  public override lookupUserWithPasskey = async (...args: any) => {
    return this.mock_lookupUserWithPasskey(...args);
  };
  public override addMfa = async (...args: any) => {
    return this.mock_addMfa(...args);
  };
  public override verifyMfa = async (...args: any) => {
    return this.mock_verifyMfa(...args);
  };
  public override removeMfa = async (...args: any) => {
    return this.mock_removeMfa(...args);
  };
  public override getMfaFactors = async () => {
    return { multiFactors: [] };
  };

  // Override lookupUserByEmail to avoid a real network call:
  public override lookupUserByEmail = async (email: string) => {
    // Return a mock result so we pretend this user always exists in "mock-org-id".
    return { orgId: "mock-org-id" };
  };

  // Override request() to avoid calling fetch:
  public override request = vi
    .fn()
    .mockImplementation(async (route: string, body: any) => {
      // Return mock responses based on the route:
      if (route === "/v1/signer-config") {
        return { email: { mode: "otp" } };
      }
      if (route === "/v1/lookup") {
        return { orgId: "mock-org-id" };
      }
      return {};
    }) as any;

  // We'll define a mock for `disconnect` so it never hangs:
  public disconnect = vi.fn();

  // Add a helper to manually emit events from the client's eventEmitter if needed:
  public emitClientEvent(
    eventName: "connectedEmail",
    user: User,
    bundle: string
  ): void;
  public emitClientEvent(eventName: "connected", user: User): void;
  public emitClientEvent(
    eventName: "connectedOtp",
    user: User,
    bundle: string
  ): void;
  public emitClientEvent(eventName: any, ...args: any[]): void {
    // Force-cast to call protected eventEmitter
    (this.eventEmitter as any).emit(eventName, ...args);
  }
}

export { MockAlchemySignerWebClient };
