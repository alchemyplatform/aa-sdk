import { describe, it, expect, beforeEach } from "vitest";
import { InMemorySink } from "../../src/logging/sinks.js";
import { LogLevel } from "../../src/logging/config.js";
import type { LogEntry } from "../../src/logging/config.js";

describe("InMemorySink", () => {
  let sink: InMemorySink;

  beforeEach(() => {
    sink = new InMemorySink();
  });

  describe("basic functionality", () => {
    it("should capture log entries", () => {
      const entry: LogEntry = {
        ts: Date.now(),
        level: LogLevel.INFO,
        namespace: "test",
        message: "test message",
        data: { key: "value" },
        context: { package: "@test/pkg", version: "1.0.0" },
      };

      sink.sink(entry);

      expect(sink.entries).toHaveLength(1);
      expect(sink.entries[0]).toEqual(entry);
    });

    it("should capture multiple entries in order", () => {
      const entry1: LogEntry = {
        ts: 1000,
        level: LogLevel.INFO,
        namespace: "test",
        message: "first",
        context: { package: "@test/pkg", version: "1.0.0" },
      };

      const entry2: LogEntry = {
        ts: 2000,
        level: LogLevel.WARN,
        namespace: "test",
        message: "second",
        context: { package: "@test/pkg", version: "1.0.0" },
      };

      sink.sink(entry1);
      sink.sink(entry2);

      expect(sink.entries).toHaveLength(2);
      expect(sink.entries[0].message).toBe("first");
      expect(sink.entries[1].message).toBe("second");
    });
  });

  describe("clear", () => {
    it("should clear all entries", () => {
      const entry: LogEntry = {
        ts: Date.now(),
        level: LogLevel.INFO,
        namespace: "test",
        message: "test",
        context: { package: "@test/pkg", version: "1.0.0" },
      };

      sink.sink(entry);
      sink.sink(entry);
      sink.sink(entry);

      expect(sink.entries).toHaveLength(3);

      sink.clear();

      expect(sink.entries).toHaveLength(0);
    });
  });

  describe("filtering helpers", () => {
    beforeEach(() => {
      const entries: LogEntry[] = [
        {
          ts: 1000,
          level: LogLevel.ERROR,
          namespace: "infra",
          message: "error message",
          context: { package: "@test/pkg", version: "1.0.0" },
        },
        {
          ts: 2000,
          level: LogLevel.INFO,
          namespace: "wallet-apis",
          message: "info message",
          context: { package: "@test/pkg", version: "1.0.0" },
        },
        {
          ts: 3000,
          level: LogLevel.DEBUG,
          namespace: "infra",
          message: "debug message",
          context: { package: "@test/pkg", version: "1.0.0" },
        },
      ];

      entries.forEach((e) => sink.sink(e));
    });

    it("should filter by level", () => {
      const errors = sink.getByLevel(LogLevel.ERROR);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe("error message");

      const infos = sink.getByLevel(LogLevel.INFO);
      expect(infos).toHaveLength(1);
      expect(infos[0].message).toBe("info message");
    });

    it("should filter by namespace", () => {
      const infraEntries = sink.getByNamespace("infra");
      expect(infraEntries).toHaveLength(2);
      expect(infraEntries[0].message).toBe("error message");
      expect(infraEntries[1].message).toBe("debug message");

      const walletEntries = sink.getByNamespace("wallet-apis");
      expect(walletEntries).toHaveLength(1);
      expect(walletEntries[0].message).toBe("info message");
    });

    it("should filter by message substring", () => {
      const errorMessages = sink.getByMessage("error");
      expect(errorMessages).toHaveLength(1);
      expect(errorMessages[0].message).toBe("error message");

      const messages = sink.getByMessage("message");
      expect(messages).toHaveLength(3);
    });

    it("should return empty array when no matches", () => {
      expect(sink.getByLevel(LogLevel.VERBOSE)).toHaveLength(0);
      expect(sink.getByNamespace("nonexistent")).toHaveLength(0);
      expect(sink.getByMessage("nonexistent")).toHaveLength(0);
    });
  });

  describe("latest", () => {
    it("should return the most recent entry", () => {
      const entry1: LogEntry = {
        ts: 1000,
        level: LogLevel.INFO,
        namespace: "test",
        message: "first",
        context: { package: "@test/pkg", version: "1.0.0" },
      };

      const entry2: LogEntry = {
        ts: 2000,
        level: LogLevel.INFO,
        namespace: "test",
        message: "last",
        context: { package: "@test/pkg", version: "1.0.0" },
      };

      sink.sink(entry1);
      sink.sink(entry2);

      expect(sink.latest()?.message).toBe("last");
    });

    it("should return undefined when no entries", () => {
      expect(sink.latest()).toBeUndefined();
    });
  });

  describe("count", () => {
    it("should return the number of entries", () => {
      expect(sink.count).toBe(0);

      const entry: LogEntry = {
        ts: Date.now(),
        level: LogLevel.INFO,
        namespace: "test",
        message: "test",
        context: { package: "@test/pkg", version: "1.0.0" },
      };

      sink.sink(entry);
      expect(sink.count).toBe(1);

      sink.sink(entry);
      expect(sink.count).toBe(2);

      sink.clear();
      expect(sink.count).toBe(0);
    });
  });

  describe("integration with logger", () => {
    it("should work with setGlobalLoggerConfig", async () => {
      const { createLogger, setGlobalLoggerConfig, LogLevel } = await import(
        "../../src/logging/index.js"
      );

      const testSink = new InMemorySink();

      setGlobalLoggerConfig({
        level: LogLevel.DEBUG,
        sinks: [testSink.sink],
      });

      const logger = createLogger({
        package: "@test/pkg",
        version: "1.0.0",
        namespace: "test",
      });

      logger.info("test message", { key: "value" });

      expect(testSink.count).toBe(1);
      expect(testSink.latest()?.message).toBe("test message");
      expect(testSink.latest()?.data).toMatchObject({ key: "value" });
    });
  });
});
