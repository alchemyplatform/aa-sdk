import type { TObject, TSchema, TTuple, StaticDecode } from "typebox";

/** Constraint for RPC method schemas from `@alchemy/wallet-api-types/rpc`. */
type RpcMethodSchema = TObject<{
  Request: TObject<{
    method: TSchema;
    params: TTuple<[TSchema, ...TSchema[]]>;
  }>;
  ReturnType: TSchema;
}>;

export function methodSchema<TReq extends TSchema, TRes extends TSchema>(
  schema: TObject<{
    Request: TObject<{ method: TSchema; params: TTuple<[TReq, ...TSchema[]]> }>;
    ReturnType: TRes;
  }>,
): { request: TReq; response: TRes } {
  return {
    request: schema.properties.Request.properties.params.items[0],
    response: schema.properties.ReturnType,
  };
}

/** Extracts the decoded params type from a method schema. */
export type MethodParams<T extends RpcMethodSchema> = StaticDecode<
  T["properties"]["Request"]["properties"]["params"]["items"][0]
>;

/** Extracts the decoded response type from a method schema. */
export type MethodResponse<T extends RpcMethodSchema> = StaticDecode<
  T["properties"]["ReturnType"]
>;
