import { z } from "zod";
import { BaseError } from "@alchemy/common";

/** Constraint for RPC method schemas from `@alchemy/wallet-api-types/rpc`. */
type RpcMethodSchema = z.ZodObject<{
  Request: z.ZodObject<{
    method: z.ZodType;
    params: z.ZodTuple<[z.ZodType, ...z.ZodType[]]>;
  }>;
  ReturnType: z.ZodType;
}>;

export function methodSchema<TReq extends z.ZodType, TRes extends z.ZodType>(
  schema: z.ZodObject<{
    Request: z.ZodObject<{
      method: z.ZodType;
      params: z.ZodTuple<[TReq, ...z.ZodType[]]>;
    }>;
    ReturnType: TRes;
  }>,
): { request: TReq; response: TRes } {
  return {
    request: schema.shape.Request.shape.params.def.items[0],
    response: schema.shape.ReturnType,
  };
}

/** Extracts the decoded params type from a method schema. */
export type MethodParams<T extends RpcMethodSchema> = z.output<
  T["shape"]["Request"]["shape"]["params"]["def"]["items"][0]
>;

/** Extracts the decoded response type from a method schema. */
export type MethodResponse<T extends RpcMethodSchema> = z.output<
  T["shape"]["ReturnType"]
>;

function isUnionIssue(
  issue: z.core.$ZodIssue,
): issue is z.core.$ZodIssueInvalidUnion {
  return issue.code === "invalid_union";
}

function formatCodecError(error: z.ZodError): string {
  let issue: z.core.$ZodIssue | undefined = error.issues[0];
  if (!issue) return "Invalid params";

  // For union errors, drill into the branch with the fewest issues (closest match).
  // Accumulate paths as we drill — each union level carries a partial path.
  const pathPrefix: PropertyKey[] = [];
  while (isUnionIssue(issue)) {
    pathPrefix.push(...issue.path);
    let best: z.core.$ZodIssue[] | undefined;
    for (const branch of issue.errors) {
      if (!best || branch.length < best.length) best = branch;
    }
    const next = best?.[0];
    if (!next) break;
    issue = next;
  }

  const fullPath = [...pathPrefix, ...issue.path];
  const path =
    fullPath.length > 0
      ? "/" + fullPath.map(String).join("/") + ": "
      : "";

  return `Invalid params: ${path}${issue.message}`;
}

export function encode<const T extends z.ZodType>(
  schema: T,
  value: z.output<T>,
): z.input<T> {
  try {
    return schema.encode(value);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BaseError(formatCodecError(error), {
        cause: error as Error,
      });
    }
    throw error;
  }
}

export function decode<const T extends z.ZodType>(
  schema: T,
  value: z.input<T>,
): z.output<T> {
  try {
    return schema.decode(value);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BaseError(formatCodecError(error), {
        cause: error as Error,
      });
    }
    throw error;
  }
}
