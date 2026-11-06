import { VERSION } from "../version.js";

export type WithAlchemyHeadersParams = {
  headers?: HeadersInit;
  apiKey?: string;
  jwt?: string;
};

export function withAlchemyHeaders({
  headers,
  apiKey,
  jwt,
}: WithAlchemyHeadersParams): Record<string, string> {
  const bearerToken = jwt ?? apiKey;
  const callerHeaders = { ...convertHeadersToObject(headers) };
  for (const name of Object.keys(callerHeaders)) {
    const normalizedName = name.toLowerCase();
    if (
      normalizedName === "alchemy-aa-sdk-version" ||
      (bearerToken && normalizedName === "authorization")
    ) {
      delete callerHeaders[name];
    }
  }
  return {
    ...callerHeaders,
    "Alchemy-AA-Sdk-Version": VERSION,
    ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
  };
}

export function convertHeadersToObject(
  headers?: HeadersInit,
): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    const headersObject = {} as Record<string, string>;
    headers.forEach((value, key) => {
      headersObject[key] = value;
    });
    return headersObject;
  }

  if (Array.isArray(headers)) {
    return headers.reduce(
      (acc, header) => {
        acc[header[0]] = header[1];
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  return headers;
}
