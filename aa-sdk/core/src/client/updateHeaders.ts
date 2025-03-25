import { TraceHeader } from "../utils/traceHeader.js";

export const ADD_BREADCRUMB = Symbol("addBreadcrumb");

export const TRACKER_HEADER = "X-Alchemy-Trace-Id";
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

export function clientHeaderTrack<X extends {}>(client: X, crumb: string): X {
  if (hasAddBreadcrumb(client)) {
    return client[ADD_BREADCRUMB](crumb);
  }
  return client;
}

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
