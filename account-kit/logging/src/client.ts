import { AnalyticsBrowser } from "@segment/analytics-next";
import { uuid } from "uuidv4";
import { WRITE_IN_DEV, WRITE_KEY } from "./_writeKey.js";
import { noopLogger } from "./noop.js";
import { ContextAllowlistPlugin } from "./plugins/contextAllowlist.js";
import { DevDestinationPlugin } from "./plugins/devDestination.js";
import type { EventsSchema, InnerLogger, LoggerContext } from "./types";

export function createClientLogger<Schema extends EventsSchema = []>(
  context: LoggerContext
): InnerLogger<Schema> {
  const isDev = window.location.hostname.includes("localhost");
  if (WRITE_KEY == null || (isDev && !WRITE_IN_DEV)) {
    // If we don't have a write key, we don't want to log anything
    // This is useful for dev so we don't log dev metrics
    //
    // We also don't allow logging on localhost unless WRITE_IN_DEV is set to true
    // WRITE_IN_DEV is only ever true if you're building from source with env vars set to true
    return noopLogger;
  }

  const analytics = AnalyticsBrowser.load(
    {
      writeKey: WRITE_KEY,
      // we disable these settings in dev so we don't fetch anything from segment
      cdnSettings: isDev
        ? {
            integrations: {},
          }
        : undefined,
    },
    // further we disable the segment integration dev
    {
      disableClientPersistence: true,
      integrations: {
        "Segment.io": !isDev,
      },
    }
  );

  if (!sessionStorage.getItem("anonId")) {
    sessionStorage.setItem("anonId", uuid());
  }

  const anonId = sessionStorage.getItem("anonId")!;
  analytics.setAnonymousId(anonId);
  analytics.register(ContextAllowlistPlugin);
  analytics.debug(isDev);

  // This lets us log events in the console
  if (isDev) {
    analytics.register(DevDestinationPlugin);
  }

  const ready: Promise<unknown> = analytics.ready();

  return {
    _internal: {
      ready,
    },
    trackEvent: async ({ name, data }) => {
      await analytics.track(name, { ...data, ...context });
    },
  };
}
