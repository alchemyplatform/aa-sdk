import { describe, it, expect } from "vitest";
import { headersUpdate } from "../../src/tracing/updateHeaders.js";

const BREADCRUMB = "X-Alchemy-Client-Breadcrumb";

describe("headersUpdate/addCrumb", () => {
  it("dedupes when last crumb is the same", () => {
    let headers: Record<string, string> = {};

    headers = headersUpdate("step")(headers);
    expect(headers[BREADCRUMB]).toBe("step");

    headers = headersUpdate("step")(headers);
    expect(headers[BREADCRUMB]).toBe("step");
  });

  it("caps to the last 8 crumbs", () => {
    let headers: Record<string, string> = {};
    for (let i = 0; i < 10; i++) {
      headers = headersUpdate(`c${i}`)(headers);
    }
    expect(headers[BREADCRUMB]).toBe(
      ["c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"].join(" > "),
    );
  });

  it("caps by size and left-truncates with ellipsis", () => {
    let headers: Record<string, string> = {};
    for (let i = 0; i < 10; i++) {
      const crumb = `L${i}-` + "x".repeat(300);
      headers = headersUpdate(crumb)(headers);
    }
    const bc = headers[BREADCRUMB] ?? "";
    expect(bc.startsWith("..."))
      .toBe(true);
    expect(bc.includes("L9-"))
      .toBe(true); // keeps the latest crumb
    expect(bc.includes("L0-"))
      .toBe(false); // drops from the left
  });
});

