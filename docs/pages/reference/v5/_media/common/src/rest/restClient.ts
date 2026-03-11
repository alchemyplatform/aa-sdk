import { FetchError } from "../errors/FetchError.js";
import { ServerError } from "../errors/ServerError.js";
import { withAlchemyHeaders } from "../utils/headers.js";
import type { RestRequestFn, RestRequestSchema } from "./types.js";

const ALCHEMY_API_URL = "https://api.g.alchemy.com";

/**
 * Parameters for creating an AlchemyRestClient instance.
 */
export type AlchemyRestClientParams = {
  /** API key for Alchemy authentication */
  apiKey?: string;
  /** JWT token for Alchemy authentication */
  jwt?: string;
  /** Custom URL (optional - defaults to Alchemy's chain-agnostic URL, but can be used to override it) */
  url?: string;
  /** Custom headers to be sent with requests */
  headers?: HeadersInit;
};

/**
 * A client for making requests to Alchemy's non-JSON-RPC endpoints.
 */
export class AlchemyRestClient<Schema extends RestRequestSchema> {
  private readonly url: string;
  private readonly headers: Headers;

  /**
   * Creates a new instance of AlchemyRestClient.
   *
   * @param {AlchemyRestClientParams} params - The parameters for configuring the client, including API key, JWT, custom URL, and headers.
   */
  constructor({ apiKey, jwt, url, headers }: AlchemyRestClientParams) {
    this.url = url ?? ALCHEMY_API_URL;
    this.headers = new Headers(withAlchemyHeaders({ headers, apiKey, jwt }));
  }

  /**
   * Makes an HTTP request to an Alchemy non-JSON-RPC endpoint.
   *
   * @param {RestRequestFn<Schema>} params - The parameters for the request
   * @returns {Promise<unknown>} The response from the request
   */
  public request: RestRequestFn<Schema> = async (params) => {
    const response = await fetch(`${this.url}/${params.route}`, {
      method: params.method,
      body: params.body ? JSON.stringify(params.body) : undefined,
      headers: this.headers,
    }).catch((error) => {
      throw new FetchError(params.route, params.method, error);
    });

    if (!response.ok) {
      throw new ServerError(
        await response.text(),
        response.status,
        new Error(response.statusText),
      );
    }

    return response.json();
  };
}
