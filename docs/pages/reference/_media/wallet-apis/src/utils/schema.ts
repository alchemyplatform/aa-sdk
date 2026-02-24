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

/**
 * Formats an {@link EncodeError} or {@link DecodeError} into a human-readable
 * string describing what went wrong, including the JSON path and the schema's
 * custom error message (if any).
 *
 * @param {TSchema} schema - The TypeBox schema that validation was run against.
 * @param {EncodeError | DecodeError} error - The error thrown by {@link Value.Encode} or {@link Value.Decode}.
 * @returns {string} A formatted error string prefixed with `"Invalid params"`.
 */
function formatCodecError(
  schema: TSchema,
  error: EncodeError | DecodeError,
): string {
  // Use only the first error — it's the most specific. Subsequent errors are
  // typically cascade noise from union/anyOf branches.
  const causeError = error.cause.errors[0];
  // errors is typed as an open array — guard against the (practically
  // impossible) empty case.
  if (!causeError) return "Invalid params";

  const path = causeError.instancePath || "(root)";

  // Prefer the schema's custom errorMessage annotation over the generic locale message.
  let message = causeError.message;
  const schemaPointer = causeError.schemaPath.replace(/^#/, "");
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

  return `Invalid params: ${path}: ${message}`;
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
      throw new BaseError(formatCodecError(schema, error), { cause: error });
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
      throw new BaseError(formatCodecError(schema, error), { cause: error });
    }
    throw error;
  }
}
