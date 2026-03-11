/**
 * Schema definition for event logging.
 * An array of event definitions with their names and optional data structures.
 */
export type EventsSchema = readonly {
  EventName: string;
  EventData?: Record<string, any>;
}[];

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Type-safe parameters for tracking events based on the provided schema.
 * Ensures event names and data structures match the schema definition.
 * When no schema is provided, allows any event with optional data.
 *
 * @template Schema - The events schema to validate against
 */
export type TrackEventParameters<Schema extends EventsSchema> =
  Schema extends readonly []
    ? { name: string; data?: any }
    : {
        [K in keyof Schema]: Prettify<
          { name: Schema[K]["EventName"] } & ([undefined] extends [
            Schema[K]["EventData"],
          ]
            ? { data?: undefined }
            : { data: Schema[K]["EventData"] })
        >;
      }[number];

/**
 * Main event logger interface for type-safe event tracking and performance profiling.
 *
 * @template Schema - The events schema defining allowed events and their data structures
 */
export interface EventLogger<Schema extends EventsSchema = []> {
  /**
   * Tracks an event with type-safe validation against the schema.
   *
   * @param params - Event parameters including name and optional data
   * @returns Promise that resolves when the event is tracked
   */
  trackEvent(
    params: TrackEventParameters<
      Schema extends readonly [] ? [] : [...Schema, PerformanceEvent]
    >,
  ): Promise<void>;

  /**
   * Wraps a function to automatically track its execution time as a performance event.
   *
   * @template TArgs - Function argument types
   * @template TRet - Function return type
   * @param name - Name identifier for the profiled function
   * @param func - Function to wrap with performance tracking
   * @returns Wrapped function that tracks execution time
   */
  profiled<TArgs extends any[], TRet>(
    name: string,
    func: (...args: TArgs) => TRet,
  ): (...args: TArgs) => TRet;

  /** Internal properties for logger state and configuration */
  _internal: {
    /** Promise that resolves when logger is ready for use */
    ready: Promise<unknown>;
    /** Anonymous identifier for this logger instance */
    anonId: string;
  };
}

/**
 * Internal logger interface without the profiled method.
 * Used internally by different logger implementations.
 *
 * @template Schema - The events schema defining allowed events and their data structures
 */
export type InnerLogger<Schema extends EventsSchema> = Omit<
  EventLogger<Schema>,
  "profiled"
>;

/**
 * Context information attached to all logged events.
 * Provides metadata about the package and version generating events.
 */
export type LoggerContext = {
  /** Name of the package generating events */
  package: string;
  /** Version of the package generating events */
  version: string;
  /** Additional context properties as key-value pairs */
  [key: string]: string;
};

/**
 * Built-in performance event schema for tracking function execution times.
 * Automatically included in all event schemas for profiled function tracking.
 */
export type PerformanceEvent = {
  EventName: "performance";
  EventData: {
    /** Execution time in milliseconds */
    executionTimeMs: number;
    /** Name of the function being profiled */
    functionName: string;
  };
};
