import { TraceHeader } from "../utils/traceHeader.js";

export const ADD_BREADCRUMB = Symbol("addBreadcrumb");

export const TRACKER_HEADER = "X-Alchemy-Trace-Id";
export const TRACKER_BREADCRUMB = "X-Alchemy-Trace-Breadcrumb";

function safeJsonParse(x: string): unknown {
  try {
    return JSON.parse(x);
  } catch (e) {
    return undefined;
  }
}
function addCrumb(previous: string | undefined, crumb: string): string {
  const previousCrumbs_ = previous && safeJsonParse(previous);
  const previousCrumbs = Array.isArray(previousCrumbs_) ? previousCrumbs_ : [];
  return JSON.stringify([crumb, ...previousCrumbs]);
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
      [TRACKER_HEADER]: Math.random().toString(36).substring(10),
      ...x,
      [TRACKER_BREADCRUMB]: addCrumb(x[TRACKER_BREADCRUMB], crumb),
      ...traceHeader.toTraceHeader(),
    };
  };
  return headerUpdate_;
}
