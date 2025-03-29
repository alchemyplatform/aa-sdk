import { TraceHeader } from "../utils/traceHeader.js";

/**
 * The symbol that is used to add a breadcrumb to the headers.
 *
 * @see headersUpdate
 */
export const ADD_BREADCRUMB = Symbol("addBreadcrumb");

/**
 * The header that is used to track the trace id.
 *
 * @see headersUpdate
 */
export const TRACKER_HEADER = "X-Alchemy-Trace-Id";

/**
 * The header that is used to track the breadcrumb.
 *
 * @see headersUpdate
 */
export const TRACKER_BREADCRUMB = "X-Alchemy-Trace-Breadcrumb";

function addCrumb(previous: string | undefined, crumb: string): string {
  if (!previous) return crumb;
  return `${previous} > ${crumb}`;
}

function hasAddBreadcrumb<A extends {}>(
  a: A
): a is A & { [ADD_BREADCRUMB]: (breadcrumb: string) => A } {
  return ADD_BREADCRUMB in a;
}

/**
 * Add a crumb to the breadcrumb.
 *
 * @see headersUpdate
 *
 * @param {X} client Clients are somethings like viem, that we are adding breadcrumbs to, and could be owning the transport. Usually a alchemy client.
 * @param {string} crumb The crumb to add to the breadcrumb
 * @returns {Function} A function that updates the headers
 */
export function clientHeaderTrack<X extends {}>(client: X, crumb: string): X {
  if (hasAddBreadcrumb(client)) {
    return client[ADD_BREADCRUMB](crumb);
  }
  return client;
}

/**
 * Update the headers with the trace header and breadcrumb.
 *
 * These trace headers are used in the imply ingestion pipeline to trace the request.
 * And the breadcrumb is used to get finer grain details in the trace.
 *
 * Then there are the trace headers that are part of the W3C trace context standard.
 *
 * @param {string} crumb The crumb to add to the breadcrumb
 * @returns {Function} A function that updates the headers
 */
export function headersUpdate(crumb: string) {
  const headerUpdate_ = (x: Record<string, string>) => {
    const traceHeader = (
      TraceHeader.fromTraceHeader(x) || TraceHeader.default()
    ).withEvent(crumb);
    return {
      [TRACKER_HEADER]: traceHeader.traceId,
      ...x,
      [TRACKER_BREADCRUMB]: addCrumb(x[TRACKER_BREADCRUMB], crumb),
      ...traceHeader.toTraceHeader(),
    };
  };
  return headerUpdate_;
}

/**
 * Remove the tracking headers. This is used in our split transport to ensure that we remove the headers that
 * are not used by the other systems.
 *
 * @param {unknown} x The headers to remove the tracking headers from
 */
export function mutateRemoveTrackingHeaders(x?: unknown) {
  if (!x) return;
  if (Array.isArray(x)) return;
  if (typeof x !== "object") return;
  TRACKER_HEADER in x && delete x[TRACKER_HEADER];
  TRACKER_BREADCRUMB in x && delete x[TRACKER_BREADCRUMB];
  "traceheader" in x && delete x["traceheader"];
  "tracestate" in x && delete x["tracestate"];
}
