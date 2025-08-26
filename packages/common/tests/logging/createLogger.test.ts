import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLogger } from "../../src/logging/index.js";
import type { LoggerContext } from "../../src/logging/types.js";

const mockContext: LoggerContext = {
  package: "@test/package",
  version: "1.0.0",
};

const mockConsoleLog = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(mockConsoleLog);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createLogger", () => {
  it("should track events in development mode", async () => {
    vi.stubGlobal("process", { env: { NODE_ENV: "development" } });

    const logger = createLogger(mockContext);
    await logger.trackEvent({
      name: "user_action",
      data: { action: "click", count: 1 },
    });

    expect(mockConsoleLog).toHaveBeenCalledWith(
      "[@test/package] Event: user_action",
      expect.objectContaining({
        action: "click",
        count: 1,
        package: "@test/package",
        version: "1.0.0",
        timestamp: expect.any(String),
      }),
    );
  });

  it("should not log in production environments", async () => {
    vi.stubGlobal("process", { env: { NODE_ENV: "production" } });
    vi.stubGlobal("__DEV__", false);

    const logger = createLogger(mockContext);
    await logger.trackEvent({ name: "test_event" });

    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it("should profile synchronous functions", () => {
    vi.stubGlobal("process", { env: { NODE_ENV: "development" } });

    const logger = createLogger(mockContext);
    const testFunction = (x: number) => x * 2;

    const profiledFunction = logger.profiled("testFunc", testFunction);
    const result = profiledFunction(5);

    expect(result).toBe(10);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "[@test/package] Event: performance",
      expect.objectContaining({
        executionTimeMs: expect.any(Number),
        functionName: "testFunc",
      }),
    );
  });

  it("should profile async functions", async () => {
    vi.stubGlobal("process", { env: { NODE_ENV: "development" } });

    const logger = createLogger(mockContext);
    const asyncFunction = async (x: number) => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      return x * 2;
    };

    const profiledFunction = logger.profiled("asyncFunc", asyncFunction);
    const result = await profiledFunction(5);

    expect(result).toBe(10);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "[@test/package] Event: performance",
      expect.objectContaining({
        executionTimeMs: expect.any(Number),
        functionName: "asyncFunc",
      }),
    );
  });
});
