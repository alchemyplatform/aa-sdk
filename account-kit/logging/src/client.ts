import type { EventLogger, EventsSchema } from "./types";

export function createClientLogger<
  Schema extends EventsSchema
>(): EventLogger<Schema> {
  return {
    trackEvent: ({ name, data }) => {
      if (window.location.hostname.includes("localhost")) {
        // don't log events from localhost... hmm how do we do this while still being able to test locally?
        // I'll come back to this once I have analytics JS setup. I think I can write events to console using analytics JS middleware
        return;
      }

      console.log(`[Client] ${name}`, data);
    },
  };
}
