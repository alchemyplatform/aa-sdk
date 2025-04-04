import { TraceHeader } from "@aa-sdk/core";

/**
 * The header that is used to track the trace id.
 *
 * @see headersUpdate
 */
const TRACKER_HEADER = "X-Alchemy-Trace-Id";

/**
 * The header that is used to track the breadcrumb.
 *
 * @see headersUpdate
 */
const TRACKER_BREADCRUMB = "X-Alchemy-Trace-Breadcrumb";

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

function addCrumb(previous: string | undefined, crumb: string): string {
  if (!previous) return crumb;
  return `${previous} > ${crumb}`;
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
      [TRACKER_HEADER]: traceHeader.parentId,
      ...x,
      [TRACKER_BREADCRUMB]: addCrumb(x[TRACKER_BREADCRUMB], crumb),
      ...traceHeader.toTraceHeader(),
    };
  };
  return headerUpdate_;
}
