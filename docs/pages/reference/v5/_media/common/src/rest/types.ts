import type { Prettify } from "viem";

export type RestRequestSchema = readonly {
  Route: string;
  Method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
  Body?: unknown | undefined;
  Response: unknown;
}[];

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
          : never)
      >;
    }[number]
  : {
      route: string;
      method: RestRequestSchema[number]["Method"];
      body?: unknown | undefined;
    };

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
