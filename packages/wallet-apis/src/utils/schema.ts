import type {
  TObject,
  TSchema,
  TTuple,
  StaticDecode,
  StaticEncode,
} from "typebox";
import { Value, EncodeError, DecodeError, Pointer } from "typebox/value";
import { BaseError } from "@alchemy/common";

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

function formatCodecError(
  schema: TSchema,
  cause: {
    errors: Array<{
      schemaPath: string;
      instancePath: string;
      message: string;
    }>;
    value: unknown;
  },
): string {
  // Use only the first error — it's the most specific. Subsequent errors are
  // typically cascade noise from union/anyOf branches.
  const error = cause.errors[0];
  if (!error) return "Invalid params";

  const path = error.instancePath || "(root)";

  // Prefer the schema's custom errorMessage annotation over the generic locale message.
  let message = error.message;
  const schemaPointer = error.schemaPath.replace(/^#/, "");
  if (schemaPointer) {
    const schemaNode = Pointer.Get(schema, schemaPointer);
    if (
      schemaNode &&
      typeof schemaNode === "object" &&
      "errorMessage" in schemaNode &&
      typeof (schemaNode as Record<string, unknown>).errorMessage === "string"
    ) {
      message = (schemaNode as Record<string, unknown>).errorMessage as string;
    }
  }

  // Include the type of the received value for context.
  let receivedType: string | undefined;
  try {
    const received = error.instancePath
      ? Pointer.Get(cause.value, error.instancePath)
      : cause.value;
    receivedType = received === null ? "null" : typeof received;
  } catch {
    // instancePath may not resolve (e.g. missing property) — skip.
  }

  const detail = receivedType
    ? `${path}: ${message} (received ${receivedType})`
    : `${path}: ${message}`;

  return `Invalid params: ${detail}`;
}

// Type-safe wrapper around `Value.Encode` with human-readable errors.
export function encode<const T extends TSchema>(
  schema: T,
  value: StaticDecode<T>,
): StaticEncode<T> {
  try {
    return Value.Encode(schema, value);
  } catch (error) {
    if (error instanceof EncodeError) {
      throw new BaseError(formatCodecError(schema, error.cause));
    }
    throw error;
  }
}

// Type-safe wrapper around `Value.Decode` with human-readable errors.
export function decode<const T extends TSchema>(
  schema: T,
  value: StaticEncode<T>,
): StaticDecode<T> {
  try {
    return Value.Decode(schema, value);
  } catch (error) {
    if (error instanceof DecodeError) {
      throw new BaseError(formatCodecError(schema, error.cause));
    }
    throw error;
  }
}
