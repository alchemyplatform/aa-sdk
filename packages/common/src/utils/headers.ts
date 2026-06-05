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
  return {
    ...convertHeadersToObject(headers),
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
