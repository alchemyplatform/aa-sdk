import type { Context, Plugin } from "@segment/analytics-next";

const allowlist: readonly string[] = ["page"] as const;

function stripContext(ctx: Context): Context {
  ctx.event.context = allowlist.reduce(
    (acc, key) => {
      acc[key] = ctx.event?.context?.[key];

      return acc;
    },
    {} as Record<(typeof allowlist)[number], unknown>,
  );

  return ctx;
}

/**
 * This plugin enforces a context allowlist for all events
 *
 * This is done to make sure that anything Analytics.js sends to Segment is only the data we want to send
 */
export const ContextAllowlistPlugin: Plugin = {
  name: "Enforce Context Allowlist",
  type: "enrichment",

  isLoaded: () => true,
  load: () => Promise.resolve(),

  track: stripContext,
  identify: stripContext,
  page: stripContext,
  alias: stripContext,
  group: stripContext,
  screen: stripContext,
};
