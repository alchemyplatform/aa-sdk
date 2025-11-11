import {
  TRACE_HEADER_NAME,
  TRACE_HEADER_STATE,
  TraceHeader,
} from "./traceHeader.js";

/**
 * The header that is used to track the trace id.
 * We use a client specific one to not mess with the span tracing of the servers.
 *
 * @see headersUpdate
 */
const TRACKER_HEADER = "X-Alchemy-Client-Trace-Id";

/**
 * The header that is used to track the breadcrumb.
 *
 * @see headersUpdate
 */
const TRACKER_BREADCRUMB = "X-Alchemy-Client-Breadcrumb";

// Breadcrumb formatting and bounds
const SEP = " > ";
const MAX_CRUMBS = 8;
const MAX_BYTES = 768; // Conservative cap to keep headers small

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
  TRACE_HEADER_NAME in x && delete x[TRACE_HEADER_NAME];
  TRACE_HEADER_STATE in x && delete x[TRACE_HEADER_STATE];
}

/**
 * Build the breadcrumb header by appending a new crumb to the previous chain
 * while keeping it bounded and readable.
 *
 * Behavior:
 * - Idempotent append: if the last crumb equals the new one, do not append.
 * - Count cap: keep only the last MAX_CRUMBS entries.
 * - Byte cap: ensure the resulting string (excluding the ellipsis prefix) is
 *   within MAX_BYTES by keeping as many right-most crumbs as fit. If truncated,
 *   prefix the output with "..." to indicate left-truncation.
 * - Uses a simple string-length approximation for bytes, which is sufficient
 *   for typical ASCII crumb names.
 *
 * @param {string | undefined} previous The existing breadcrumb header value, if any
 * @param {string} crumb The new crumb to append
 * @returns {string} The updated, bounded breadcrumb header value
 */
function addCrumb(previous: string | undefined, crumb: string): string {
  if (!previous) return crumb;

  const parts = previous.split(SEP).filter(Boolean);
  const last = parts[parts.length - 1];
  if (last === crumb) return previous; // idempotent on retries

  // Append and apply count cap
  parts.push(crumb);
  const tail = parts.slice(-MAX_CRUMBS);

  // Enforce byte cap by taking from right to left until it fits
  let used = 0;
  const kept: string[] = [];
  for (let i = tail.length - 1; i >= 0; i--) {
    const part = tail[i];
    const addLen = (kept.length ? SEP.length : 0) + part.length;
    if (used + addLen > MAX_BYTES) break;
    kept.unshift(part);
    used += addLen;
  }

  const truncated = kept.length < tail.length;
  return (truncated ? "..." : "") + kept.join(SEP);
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
