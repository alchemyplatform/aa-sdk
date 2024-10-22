import type { InnerLogger } from "./types";

export const noopLogger: InnerLogger<any> = {
  trackEvent: async () => {},
  _internal: {
    ready: Promise.resolve(),
  },
};
