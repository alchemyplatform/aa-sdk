import type { InnerLogger } from "./types.js";

/**
 * No-operation logger that discards all events.
 * Used as a fallback when logger initialization fails or in disabled states.
 */
export const noopLogger: InnerLogger<any> = {
  trackEvent: async () => {},
  _internal: {
    ready: Promise.resolve(),
    anonId: "",
  },
};
