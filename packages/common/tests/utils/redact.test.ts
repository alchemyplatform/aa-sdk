import { describe, expect, it } from "vitest";
import { redactUrlCredentials } from "../../src/utils/redact.js";

describe("redactUrlCredentials", () => {
  it("redacts /v2/<key> path segments and apiKey query params", () => {
    expect(
      redactUrlCredentials(
        "https://eth-mainnet.g.alchemy.com/v2/supersecret123 and https://x.test/?apiKey=supersecret123&y=1",
      ),
    ).toBe(
      "https://eth-mainnet.g.alchemy.com/v2/[redacted] and https://x.test/?apiKey=[redacted]&y=1",
    );
  });

  it("leaves credential-free text untouched", () => {
    expect(redactUrlCredentials("plain message")).toBe("plain message");
  });
});
