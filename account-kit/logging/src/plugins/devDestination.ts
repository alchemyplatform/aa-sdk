import type { Context, Plugin } from "@segment/analytics-next";

function consoleLogEvent(ctx: Context): Context {
  console.log(JSON.stringify(ctx.event, null, 2));

  return ctx;
}

export const DevDestinationPlugin: Plugin = {
  name: "Dev Destination Plugin",
  type: "destination",
  isLoaded: () => true,
  load: () => Promise.resolve(),

  track: consoleLogEvent,
  identify: consoleLogEvent,
  page: consoleLogEvent,
  alias: consoleLogEvent,
  group: consoleLogEvent,
  screen: consoleLogEvent,
};
