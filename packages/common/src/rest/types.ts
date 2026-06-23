/** Flattens an intersection for readable hover types (viem-equivalent, local to stay viem-free). */
type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Values the query serializer accepts (null/undefined entries are skipped). */
export type QueryValue = string | number | boolean | null | undefined;

/** A query-params object; array values serialize as repeated keys. */
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

export type RestRequestSchema = readonly {
  Route: string;
  Method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
  Body?: unknown | undefined;
  Query?: unknown | undefined;
  Response: unknown;
}[];

/** Per-request runtime options; values override the client-level defaults. */
export type RestRequestOptions = {
  /** Abort the request (and any pending retries). */
  signal?: AbortSignal;
  /** Max retry attempts after the initial request (client default applies when omitted). */
  retryCount?: number;
  /** Base backoff delay in ms (client default applies when omitted). */
  retryDelay?: number;
  /** Per-attempt timeout in ms (client default applies when omitted). */
  timeout?: number;
};

/**
 * Reads a schema entry's Query member without indexed access, so legacy
 * entries that never declared Query resolve to undefined instead of erroring.
 */
type EntryQuery<Entry> = "Query" extends keyof Entry
  ? Entry["Query"]
  : undefined;

export type RestRequestParams<
  Schema extends RestRequestSchema | undefined = undefined,
> = Schema extends RestRequestSchema
  ? {
      [K in keyof Schema]: Prettify<
        {
          route: Schema[K] extends Schema[number] ? Schema[K]["Route"] : never;
          method: Schema[K] extends Schema[number]
            ? Schema[K]["Method"]
            : never;
        } & (Schema[K] extends Schema[number]
          ? Schema[K]["Body"] extends undefined
            ? { body?: undefined }
            : { body: Schema[K]["Body"] }
          : never) &
          (Schema[K] extends Schema[number]
            ? EntryQuery<Schema[K]> extends undefined
              ? { query?: undefined }
              : undefined extends EntryQuery<Schema[K]>
                ? { query?: EntryQuery<Schema[K]> }
                : { query: EntryQuery<Schema[K]> }
            : never) &
          RestRequestOptions
      >;
    }[number]
  : {
      route: string;
      method: RestRequestSchema[number]["Method"];
      body?: unknown | undefined;
      query?: QueryParams | undefined;
    } & RestRequestOptions;

export type RestRequestFn<
  Schema extends RestRequestSchema | undefined = undefined,
> = <
  _parameters extends RestRequestParams<Schema> = RestRequestParams<Schema>,
  _returnType = Schema extends RestRequestSchema
    ? Extract<Schema[number], { Route: _parameters["route"] }>["Response"]
    : unknown,
>(
  params: _parameters,
) => Promise<_returnType>;
