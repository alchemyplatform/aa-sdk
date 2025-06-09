function generateRandomHexString(numBytes: number) {
  const hexPairs = new Array(numBytes).fill(0).map(() =>
    Math.floor(Math.random() * 16)
      .toString(16)
      .padStart(2, "0"),
  );
  return hexPairs.join("");
}

/**
 * These are the headers that are used in the trace headers, could be found in the spec
 *
 * @see https://www.w3.org/TR/trace-context/#design-overview
 */

export const TRACE_HEADER_NAME = "traceparent";
/**
 * These are the headers that are used in the trace headers, could be found in the spec
 *
 * @see https://www.w3.org/TR/trace-context/#design-overview
 */
export const TRACE_HEADER_STATE = "tracestate";

const clientTraceId = generateRandomHexString(16);
/**
 * Some tools that are useful when dealing with the values
 * of the trace header. Follows the W3C trace context standard.
 *
 * @see https://www.w3.org/TR/trace-context/
 */
export class TraceHeader {
  readonly traceId: string;
  readonly parentId: string;
  readonly traceFlags: string;
  readonly traceState: Record<string, string>;

  /**
   * Initializes a new instance with the provided trace identifiers and state information.
   *
   * @param {string} traceId The unique identifier for the trace
   * @param {string} parentId The identifier of the parent trace
   * @param {string} traceFlags Flags containing trace-related options
   * @param {TraceHeader["traceState"]} traceState The trace state information for additional trace context
   */
  constructor(
    traceId: string,
    parentId: string,
    traceFlags: string,
    traceState: TraceHeader["traceState"],
  ) {
    this.traceId = traceId;
    this.parentId = parentId;
    this.traceFlags = traceFlags;
    this.traceState = traceState;
  }

  /**
   * Creating a default trace id that is a random setup for both trace id and parent id
   *
   * @example ```ts
   * const traceHeader = TraceHeader.fromTraceHeader(headers) || TraceHeader.default();
   * ```
   *
   * @returns {TraceHeader} A default trace header
   */
  static default() {
    return new TraceHeader(
      clientTraceId,
      generateRandomHexString(8),
      "00", //Means no flag have been set, and no sampled state https://www.w3.org/TR/trace-context/#trace-flags
      {},
    );
  }
  /**
   * Should be able to consume a trace header from the headers of an http request
   *
   * @example ```ts
   * const traceHeader = TraceHeader.fromTraceHeader(headers);
   * ```
   *
   * @param {Record<string,string>} headers The headers from the http request
   * @returns {TraceHeader | undefined} The trace header object, or nothing if not found
   */
  static fromTraceHeader(
    headers: Record<string, string>,
  ): TraceHeader | undefined {
    if (!headers[TRACE_HEADER_NAME]) {
      return undefined;
    }
    const [version, traceId, parentId, traceFlags] =
      headers[TRACE_HEADER_NAME]?.split("-");

    const traceState =
      headers[TRACE_HEADER_STATE]?.split(",").reduce(
        (acc, curr) => {
          const [key, value] = curr.split("=");
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>,
      ) || {};
    if (version !== "00") {
      console.debug(
        new Error(
          `Invalid version for traceheader: ${headers[TRACE_HEADER_NAME]}`,
        ),
      );
      return undefined;
    }
    return new TraceHeader(traceId, parentId, traceFlags, traceState);
  }

  /**
   * Should be able to convert the trace header to the format that is used in the headers of an http request
   *
   * @example ```ts
   * const traceHeader = TraceHeader.fromTraceHeader(headers) || TraceHeader.default();
   * const headers = traceHeader.toTraceHeader();
   * ```
   *
   * @returns {{traceparent: string, tracestate: string}} The trace header in the format of a record, used in our http client
   */
  toTraceHeader() {
    return {
      [TRACE_HEADER_NAME]: `00-${this.traceId}-${this.parentId}-${this.traceFlags}`,
      [TRACE_HEADER_STATE]: Object.entries(this.traceState)
        .map(([key, value]) => `${key}=${value}`)
        .join(","),
    } as const;
  }

  /**
   * Should be able to create a new trace header with a new event in the trace state,
   *  as the key of the eventName as breadcrumbs appending onto previous breadcrumbs with the - infix if exists. And the
   * trace parent gets updated as according to the docs
   *
   * @example ```ts
   * const traceHeader = TraceHeader.fromTraceHeader(headers) || TraceHeader.default();
   * const newTraceHeader = traceHeader.withEvent("newEvent");
   * ```
   *
   * @param {string} eventName The key of the new event
   * @returns {TraceHeader} The new trace header
   */
  withEvent(eventName: string): TraceHeader {
    const breadcrumbs = this.traceState.breadcrumbs
      ? `${this.traceState.breadcrumbs}-${eventName}`
      : eventName;
    return new TraceHeader(this.traceId, this.parentId, this.traceFlags, {
      ...this.traceState,
      breadcrumbs,
    });
  }
}
