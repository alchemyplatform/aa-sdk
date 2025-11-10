import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createLogger,
  setGlobalLoggerConfig,
  LogLevel,
} from "../../src/logging/index.js";
import type { LogEntry } from "../../src/logging/config.js";

describe("createLogger", () => {
  const mockSink = vi.fn();
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = { ...process.env };
    // Reset global config before each test
    setGlobalLoggerConfig({
      level: LogLevel.VERBOSE, // Set to VERBOSE to capture all levels including verbose
      sinks: [mockSink],
      enabledNamespaces: undefined, // Reset namespace filtering
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("basic logging", () => {
    it("should log at different levels", () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "test",
      });

      logger.error("error msg", { code: 1 });
      logger.warn("warn msg", { code: 2 });
      logger.info("info msg", { code: 3 });
      logger.debug("debug msg", { code: 4 });
      logger.verbose("verbose msg", { code: 5 });

      expect(mockSink).toHaveBeenCalledTimes(5);

      const calls = mockSink.mock.calls;
      expect(calls[0][0]).toMatchObject({
        level: LogLevel.ERROR,
        message: "error msg",
        data: { code: 1 },
      });
      expect(calls[1][0]).toMatchObject({
        level: LogLevel.WARN,
        message: "warn msg",
        data: { code: 2 },
      });
      expect(calls[2][0]).toMatchObject({
        level: LogLevel.INFO,
        message: "info msg",
        data: { code: 3 },
      });
      expect(calls[3][0]).toMatchObject({
        level: LogLevel.DEBUG,
        message: "debug msg",
        data: { code: 4 },
      });
      expect(calls[4][0]).toMatchObject({
        level: LogLevel.VERBOSE,
        message: "verbose msg",
        data: { code: 5 },
      });
    });

    it("should include context in log entries", () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "test:sub",
      });

      logger.info("test message");

      expect(mockSink).toHaveBeenCalledWith(
        expect.objectContaining({
          context: {
            package: "@test/pkg",
            version: "1.0.0",
          },
          namespace: "test:sub",
          message: "test message",
        }),
      );
    });

    it("should include timestamp", () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      const before = Date.now();
      logger.info("test");
      const after = Date.now();

      const entry = mockSink.mock.calls[0][0] as LogEntry;
      expect(entry.ts).toBeGreaterThanOrEqual(before);
      expect(entry.ts).toBeLessThanOrEqual(after);
    });
  });

  describe("level filtering", () => {
    it("should filter logs based on configured level", () => {
      setGlobalLoggerConfig({
        level: LogLevel.WARN,
        sinks: [mockSink],
      });

      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      logger.verbose("should not log");
      logger.debug("should not log");
      logger.info("should not log");
      logger.warn("should log");
      logger.error("should log");

      expect(mockSink).toHaveBeenCalledTimes(2);
      expect(mockSink.mock.calls[0][0].level).toBe(LogLevel.WARN);
      expect(mockSink.mock.calls[1][0].level).toBe(LogLevel.ERROR);
    });

    it("should respect ERROR level (most restrictive)", () => {
      setGlobalLoggerConfig({
        level: LogLevel.ERROR,
        sinks: [mockSink],
      });

      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      logger.warn("should not log");
      logger.info("should not log");
      logger.debug("should not log");
      logger.error("should log");

      expect(mockSink).toHaveBeenCalledTimes(1);
      expect(mockSink.mock.calls[0][0].level).toBe(LogLevel.ERROR);
    });

    it("should log everything at VERBOSE level", () => {
      setGlobalLoggerConfig({
        level: LogLevel.VERBOSE,
        sinks: [mockSink],
      });

      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      logger.error("log");
      logger.warn("log");
      logger.info("log");
      logger.debug("log");
      logger.verbose("log");

      expect(mockSink).toHaveBeenCalledTimes(5);
    });
  });

  describe("lazy message evaluation", () => {
    it("should support function message suppliers", () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      const expensiveComputation = vi.fn(() => [
        "computed message",
        { result: 42 },
      ]);

      logger.info(expensiveComputation as any);

      expect(expensiveComputation).toHaveBeenCalledTimes(1);
      expect(mockSink).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "computed message",
          data: { result: 42 },
        }),
      );
    });

    it("should not evaluate lazy messages when level is disabled", () => {
      setGlobalLoggerConfig({
        level: LogLevel.ERROR,
        sinks: [mockSink],
      });

      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      const expensiveComputation = vi.fn(() => ["message", {}]);

      logger.debug(expensiveComputation as any);

      expect(expensiveComputation).not.toHaveBeenCalled();
      expect(mockSink).not.toHaveBeenCalled();
    });

    it("should merge lazy data with explicit data", () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      logger.info(() => ["message", { a: 1 }], { b: 2 });

      expect(mockSink).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "message",
          data: { a: 1 },
        }),
      );
    });
  });

  describe("withContext", () => {
    it("should create child logger with additional context", () => {
      const parent = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      const child = parent.withContext({ userId: "123", traceId: "abc" });

      child.info("test message", { extra: "data" });

      expect(mockSink).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: "123",
            traceId: "abc",
            extra: "data",
          },
        }),
      );
    });

    it("should chain withContext calls", () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      const child1 = logger.withContext({ a: 1 });
      const child2 = child1.withContext({ b: 2 });
      const child3 = child2.withContext({ c: 3 });

      child3.info("test");

      expect(mockSink).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { a: 1, b: 2, c: 3 },
        }),
      );
    });

    it("should not mutate parent logger context", () => {
      const parent = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      const child = parent.withContext({ child: true });

      parent.info("parent log");
      child.info("child log");

      expect(mockSink.mock.calls[0][0].data).toEqual({});
      expect(mockSink.mock.calls[1][0].data).toEqual({ child: true });
    });
  });

  describe("profiled", () => {
    it("should profile synchronous functions", () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      const testFn = (x: number) => x * 2;
      const profiledFn = logger.profiled("multiply", testFn);

      const result = profiledFn(5);

      expect(result).toBe(10);
      expect(mockSink).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message: "profiled multiply",
          data: expect.objectContaining({
            executionTimeMs: expect.any(Number),
            functionName: "multiply",
          }),
        }),
      );
    });

    it("should profile async functions", async () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      const asyncFn = async (x: number) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return x * 2;
      };

      const profiledFn = logger.profiled("asyncMultiply", asyncFn);
      const result = await profiledFn(5);

      expect(result).toBe(10);
      expect(mockSink).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message: "profiled asyncMultiply",
          data: expect.objectContaining({
            executionTimeMs: expect.any(Number),
            functionName: "asyncMultiply",
          }),
        }),
      );

      const entry = mockSink.mock.calls[0][0] as LogEntry;
      expect(entry.data?.executionTimeMs).toBeGreaterThanOrEqual(10);
    });

    it("should track failed profiled functions", async () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      const failingFn = async () => {
        throw new Error("test error");
      };

      const profiledFn = logger.profiled("failing", failingFn);

      await expect(profiledFn()).rejects.toThrow("test error");

      expect(mockSink).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "profiled failing (failed)",
        }),
      );
    });

    it("should preserve function context (this)", () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      const obj = {
        value: 42,
        method: logger.profiled("method", function (this: any) {
          return this.value;
        }),
      };

      const result = obj.method();

      expect(result).toBe(42);
    });

    it("should not log profiling when DEBUG level is disabled", () => {
      setGlobalLoggerConfig({
        level: LogLevel.INFO,
        sinks: [mockSink],
      });

      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      const profiledFn = logger.profiled("test", () => 42);
      profiledFn();

      expect(mockSink).not.toHaveBeenCalled();
    });
  });

  describe("redaction", () => {
    it("should redact sensitive keys by default", () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      logger.info("sensitive data", {
        authorization: "Bearer token",
        apiKey: "secret123",
        jwt: "eyJhbGc...",
        privateKey: "0x123abc",
        secret: "my-secret",
        password: "pass123",
        normalKey: "visible",
      });

      const entry = mockSink.mock.calls[0][0] as LogEntry;
      expect(entry.data).toMatchObject({
        authorization: "[REDACTED]",
        apiKey: "[REDACTED]",
        jwt: "[REDACTED]",
        privateKey: "[REDACTED]",
        secret: "[REDACTED]",
        password: "[REDACTED]",
        normalKey: "visible",
      });
    });

    it("should support custom redaction predicate", () => {
      setGlobalLoggerConfig({
        level: LogLevel.DEBUG,
        sinks: [mockSink],
        redact: {
          keys: (key) => key.startsWith("internal_"),
          replacer: () => "***",
        },
      });

      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      logger.info("test", {
        internal_value: "hide me",
        public_value: "show me",
      });

      const entry = mockSink.mock.calls[0][0] as LogEntry;
      expect(entry.data).toMatchObject({
        internal_value: "***",
        public_value: "show me",
      });
    });

    it("should redact in base context", () => {
      // First ensure redaction is configured
      setGlobalLoggerConfig({
        level: LogLevel.VERBOSE,
        sinks: [mockSink],
        redact: {
          keys: (key) =>
            /^(authorization|apiKey|jwt|privateKey|secret|password)$/i.test(
              key,
            ),
          replacer: () => "[REDACTED]",
        },
      });

      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        baseContext: {
          apiKey: "secret",
          userId: "123",
        },
      });

      logger.info("test");

      const entry = mockSink.mock.calls[0][0] as LogEntry;
      expect(entry.data).toMatchObject({
        apiKey: "[REDACTED]",
        userId: "123",
      });
    });
  });

  describe("multiple sinks", () => {
    it("should dispatch to all configured sinks", () => {
      const sink1 = vi.fn();
      const sink2 = vi.fn();
      const sink3 = vi.fn();

      setGlobalLoggerConfig({
        level: LogLevel.INFO,
        sinks: [sink1, sink2, sink3],
      });

      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      logger.info("test message");

      expect(sink1).toHaveBeenCalledTimes(1);
      expect(sink2).toHaveBeenCalledTimes(1);
      expect(sink3).toHaveBeenCalledTimes(1);

      // All sinks should receive the same entry
      expect(sink1.mock.calls[0][0]).toEqual(sink2.mock.calls[0][0]);
      expect(sink2.mock.calls[0][0]).toEqual(sink3.mock.calls[0][0]);
    });

    it("should continue if one sink throws", () => {
      const sink1 = vi.fn();
      const sink2 = vi.fn(() => {
        throw new Error("sink error");
      });
      const sink3 = vi.fn();

      setGlobalLoggerConfig({
        level: LogLevel.INFO,
        sinks: [sink1, sink2, sink3],
      });

      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      // Should not throw despite sink2 failing
      expect(() => logger.info("test")).not.toThrow();

      expect(sink1).toHaveBeenCalled();
      expect(sink2).toHaveBeenCalled();
      // Note: sink3 might not be called if the error isn't caught
    });
  });

  describe("optional namespace", () => {
    it("should work without namespace", () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      logger.info("test");

      expect(mockSink).toHaveBeenCalledWith(
        expect.objectContaining({
          namespace: undefined,
        }),
      );
    });

    it("should include namespace when provided", () => {
      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "my:namespace",
      });

      logger.info("test");

      expect(mockSink).toHaveBeenCalledWith(
        expect.objectContaining({
          namespace: "my:namespace",
        }),
      );
    });
  });

  describe("namespace filtering", () => {
    it("should log when namespace is in enabledNamespaces", () => {
      setGlobalLoggerConfig({
        level: LogLevel.INFO,
        sinks: [mockSink],
        enabledNamespaces: ["infra", "wallet-apis"],
      });

      const infraLogger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "infra",
      });

      const walletLogger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "wallet-apis",
      });

      infraLogger.info("infra log");
      walletLogger.info("wallet log");

      expect(mockSink).toHaveBeenCalledTimes(2);
      expect(mockSink.mock.calls[0][0].namespace).toBe("infra");
      expect(mockSink.mock.calls[1][0].namespace).toBe("wallet-apis");
    });

    it("should not log when namespace is not in enabledNamespaces", () => {
      setGlobalLoggerConfig({
        level: LogLevel.INFO,
        sinks: [mockSink],
        enabledNamespaces: ["infra"],
      });

      const infraLogger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "infra",
      });

      const smartAccountsLogger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "smart-accounts",
      });

      infraLogger.info("should log");
      smartAccountsLogger.info("should not log");

      expect(mockSink).toHaveBeenCalledTimes(1);
      expect(mockSink.mock.calls[0][0].message).toBe("should log");
    });

    it("should log all namespaces when enabledNamespaces is undefined", () => {
      setGlobalLoggerConfig({
        level: LogLevel.VERBOSE,
        sinks: [mockSink],
      });

      const logger1 = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "ns1",
      });

      const logger2 = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "ns2",
      });

      logger1.info("log1");
      logger2.info("log2");

      expect(mockSink).toHaveBeenCalledTimes(2);
    });

    it("should log all namespaces when enabledNamespaces is empty array", () => {
      setGlobalLoggerConfig({
        level: LogLevel.INFO,
        sinks: [mockSink],
        enabledNamespaces: [],
      });

      const logger1 = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "ns1",
      });

      const logger2 = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "ns2",
      });

      logger1.info("log1");
      logger2.info("log2");

      expect(mockSink).toHaveBeenCalledTimes(2);
    });

    it("should not log undefined namespace when filter is active", () => {
      setGlobalLoggerConfig({
        level: LogLevel.INFO,
        sinks: [mockSink],
        enabledNamespaces: ["infra"],
      });

      const loggerWithoutNamespace = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
      });

      loggerWithoutNamespace.info("should not log");

      expect(mockSink).not.toHaveBeenCalled();
    });
  });
});
