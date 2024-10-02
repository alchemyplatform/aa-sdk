import type { EventLogger } from "./types";

export const noopLogger: EventLogger<any> = {
  trackEvent: () => {},
};
