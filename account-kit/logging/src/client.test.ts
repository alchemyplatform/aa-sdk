import { vi } from "vitest";
import * as writeKeyConfig from "./_writeKey.js";
import * as fetchKeyModule from "./fetchRemoteWriteKey.js";
import { noopLogger } from "./noop.js";
import type { LoggerContext } from "./types.js";

const devSpy = vi.spyOn(writeKeyConfig, "WRITE_IN_DEV", "get");
const keySpy = vi.spyOn(fetchKeyModule, "fetchRemoteWriteKey");

type TestSchema = [
  {
    EventName: "test";
    EventData: {
      test: boolean;
    };
  },
];

describe("Client Logger", () => {
  const loggerContext: LoggerContext = {
    package: "test/signer",
    version: "1.0.0",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // @ts-ignore this does exist
    global.jsdom.reconfigure({ url: "http://localhost" });

    keySpy.mockImplementation(async () => undefined);
  });

  it("should not log events if no write key", async () => {
    // @ts-ignore this does exist
    global.jsdom.reconfigure({ url: "https://test.com" });
    const consoleSpy = vi.spyOn(console, "log");
    consoleSpy.mockImplementation(() => {});
    const { createClientLogger } = await import("./client.js");

    const logger = createClientLogger<TestSchema>(loggerContext);
    await logger._internal.ready;
    await logger.trackEvent({ name: "test", data: { test: true } });

    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it("should create a no-op logger if not write in dev", async () => {
    devSpy.mockImplementation(() => false);

    const { createClientLogger } = await import("./client.js");

    const logger = createClientLogger<TestSchema>(loggerContext);
    expect(logger).toBe(noopLogger);
  });

  it("should create a valid logger if not localhost", async () => {
    keySpy.mockImplementation(() => Promise.resolve("test-key"));
    // @ts-ignore this does exist
    global.jsdom.reconfigure({ url: "https://test.com" });

    const { createClientLogger } = await import("./client.js");

    const logger = createClientLogger<TestSchema>(loggerContext);
    expect(logger).not.toBe(noopLogger);
  });

  it("should create a console logger in dev", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    keySpy.mockImplementation(() => Promise.resolve("test-key"));
    devSpy.mockImplementation(() => true);
    const consoleSpy = vi.spyOn(console, "log");
    consoleSpy.mockImplementation(() => {});

    const { createClientLogger } = await import("./client.js");

    const logger = createClientLogger<TestSchema>(loggerContext);
    expect(logger).not.toBe(noopLogger);
    await logger._internal.ready;

    await logger.trackEvent({ name: "test", data: { test: true } });
    expect(fetchSpy).toHaveBeenCalledTimes(0);

    expect(JSON.parse(consoleSpy.mock.calls[1][0])).toMatchInlineSnapshot(
      {
        timestamp: expect.any(String),
        messageId: expect.any(String),
        anonymousId: expect.any(String),
      },
      `
      {
        "anonymousId": Any<String>,
        "context": {
          "page": {
            "path": "/",
            "referrer": "",
            "search": "",
            "title": "",
            "url": "http://localhost/",
          },
        },
        "event": "test",
        "integrations": {
          "Segment.io": false,
        },
        "messageId": Any<String>,
        "properties": {
          "package": "test/signer",
          "test": true,
          "version": "1.0.0",
        },
        "timestamp": Any<String>,
        "type": "track",
      }
    `,
    );
  });
});
