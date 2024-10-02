import { vi } from "vitest";
import * as writeKeyConfig from "./_writeKey.js";
import { noopLogger } from "./noop.js";

const devSpy = vi.spyOn(writeKeyConfig, "WRITE_IN_DEV", "get");
const keySpy = vi.spyOn(writeKeyConfig, "WRITE_KEY", "get");

describe("Client Logger", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // @ts-ignore this does exist
    global.jsdom.reconfigure({ url: "http://localhost" });
  });

  it("should create a no-op logger if no write key", async () => {
    keySpy.mockImplementation(() => undefined);

    const { createClientLogger } = await import("./client.js");

    const logger = createClientLogger();
    expect(logger).toBe(noopLogger);
  });

  it("should create a no-op logger if not write in dev", async () => {
    devSpy.mockImplementation(() => true);

    const { createClientLogger } = await import("./client.js");

    const logger = createClientLogger();
    expect(logger).toBe(noopLogger);
  });

  it("should create a valid logger if not localhost", async () => {
    keySpy.mockImplementation(() => "test-key");
    // @ts-ignore this does exist
    global.jsdom.reconfigure({ url: "https://test.com" });

    const { createClientLogger } = await import("./client.js");

    const logger = createClientLogger();
    expect(logger).not.toBe(noopLogger);
  });

  it("should create a console logger in dev", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    keySpy.mockImplementation(() => "test-key");
    devSpy.mockImplementation(() => true);
    const consoleSpy = vi.spyOn(console, "log");
    consoleSpy.mockImplementation(() => {});

    const { createClientLogger } = await import("./client.js");

    const logger = createClientLogger();
    expect(logger).not.toBe(noopLogger);
    await logger._internal.ready;

    await logger.trackEvent({ name: "test", data: { test: true } });
    expect(fetchSpy).toHaveBeenCalledTimes(0);
    expect(JSON.parse(consoleSpy.mock.calls[0][0])).toMatchInlineSnapshot(
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
          "test": true,
        },
        "timestamp": Any<String>,
        "type": "track",
      }
    `
    );
  });
});
