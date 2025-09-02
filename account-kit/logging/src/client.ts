import { AnalyticsBrowser } from "@segment/analytics-next";
import { v4 as uuid } from "uuid";
import { WRITE_IN_DEV } from "./_writeKey.js";
import { fetchRemoteWriteKey } from "./fetchRemoteWriteKey.js";
import { noopLogger } from "./noop.js";
import { ContextAllowlistPlugin } from "./plugins/contextAllowlist.js";
import { DevDestinationPlugin } from "./plugins/devDestination.js";
import type { EventsSchema, InnerLogger, LoggerContext } from "./types";
import { isClientDevMode } from "./utils.js";

const ANON_ID_STORAGE_KEY = "account-kit:anonId";

type AnonId = { id: string; expiresMs: number };

function getOrCreateAnonId(): AnonId {
  let anon: AnonId | null = JSON.parse(
    localStorage.getItem(ANON_ID_STORAGE_KEY) ?? "null",
  );

  if (!anon || anon.expiresMs < Date.now()) {
    anon = {
      id: uuid(),
      // expires a month from now (30days * 24hrs/day * 60min/hr * 60sec/min * 1000ms/sec)
      expiresMs: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(ANON_ID_STORAGE_KEY, JSON.stringify(anon));
  }

  return anon;
}

/**
 * @deprecated Note that Segment is no longer used as of Spet 2, 2025. We will migrate to a new metrics provider in v5.
 * @param {LoggerContext} context - The logger context configuration
 * @returns {InnerLogger<Schema>} The inner logger instance
 */
export function createClientLogger<Schema extends EventsSchema = []>(
  context: LoggerContext,
): InnerLogger<Schema> {
  const isDev = isClientDevMode();
  if (isDev && !WRITE_IN_DEV) {
    // If we don't have a write key, we don't want to log anything
    // This is useful for dev so we don't log dev metrics
    //
    // We also don't allow logging on localhost unless WRITE_IN_DEV is set to true
    // WRITE_IN_DEV is only ever true if you're building from source with env vars set to true
    return noopLogger;
  }

  const analytics = new AnalyticsBrowser();
  const writeKey = fetchRemoteWriteKey();

  const { id: anonId } = getOrCreateAnonId();
  analytics.setAnonymousId(anonId);
  analytics.register(ContextAllowlistPlugin);
  analytics.debug(isDev);

  if (isDev) {
    // Super weird behaviour, but if I don't add some kind of log here,
    // then I don't actually get logs in the console
    console.log(`[Metrics] metrics initialized for ${context.package}`);
  }

  // This lets us log events in the console
  if (isDev) {
    analytics.register(DevDestinationPlugin);
  }

  const ready: Promise<unknown> = writeKey.then((writeKey) => {
    if (writeKey == null) {
      return;
    }

    analytics.load(
      {
        writeKey,
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
      },
    );

    return analytics.ready();
  });

  return {
    _internal: {
      ready,
      anonId,
    },
    trackEvent: async ({ name, data }) => {
      if (!(await writeKey)) {
        return noopLogger.trackEvent({
          name,
          // @ts-expect-error
          data,
        });
      }

      await analytics.track(name, { ...data, ...context });
    },
  };
}
