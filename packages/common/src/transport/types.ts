import type { OneOf, Prettify } from "viem";
import type { BaseError } from "../errors/BaseError";

export type HttpRequestSchema = readonly {
  Route: string;
  Method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
  Body?: unknown | undefined;
  Response: unknown;
}[];

export type HttpRequestParams<
  Schema extends HttpRequestSchema | undefined = undefined,
> = Schema extends HttpRequestSchema
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
          : never)
      >;
    }[number]
  : {
      route: string;
      method: HttpRequestSchema[number]["Method"];
      body?: unknown | undefined;
    };

export type HttpRequestFn<
  Schema extends HttpRequestSchema | undefined = undefined,
> = <
  _parameters extends HttpRequestParams<Schema> = HttpRequestParams<Schema>,
  _returnType = Schema extends HttpRequestSchema
    ? OneOf<
        | {
            result: Extract<
              Schema[number],
              { Route: _parameters["route"] }
            >["Response"];
            error?: never;
          }
        | { error: BaseError; result?: never }
      >
    : unknown,
>(
  params: _parameters,
) => Promise<_returnType>;
