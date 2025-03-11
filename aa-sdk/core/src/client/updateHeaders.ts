import { TraceHeader } from "../utils/traceHeader.js";

export const UPDATE_HEADER = Symbol("updateHeader");
export type UpdateHeaderFn = (
  previous: Record<string, string>
) => Record<string, string>;

export type UpdateHeader<T> = {
  [UPDATE_HEADER]<This extends T>(this: This, update: UpdateHeaderFn): This;
};

export const TRACKER_HEADER = "X-Alchemy-Trace-Id";
export const TRACKER_BREADCRUMB = "X-Alchemy-Trace-Breadcrumb";

function addCrumb(previous: string | undefined, crumb: string): string {
  return previous ? `${previous} - ${crumb}` : crumb;
}

function hasUpdateHeader<A extends {}>(a: A): a is A & UpdateHeader<A> {
  return UPDATE_HEADER in a;
}

function maybeUpdateHeader<A extends {}>(
  a: A,
  updateHeader: UpdateHeaderFn
): A {
  if (hasUpdateHeader(a)) {
    return a[UPDATE_HEADER](updateHeader);
  }
  return a;
}

export function clientHeaderTrack<X extends {}>(client: X, crumb: string): X {
  return maybeUpdateHeader(client, headersUpdate(crumb));
}
export function headersUpdate(crumb: string): UpdateHeaderFn {
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
