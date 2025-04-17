import type { SignerBody, SignerResponse, SignerRoutes } from "./types.js";
import { VERSION } from "../version.js";
import type { ConnectionConfig } from "@aa-sdk/core";
import type { TSignedRequest } from "@turnkey/http";

export class AlchemySignerClient {
  private baseUrl: string;
  private basePath = "/signer";
  private headers: Headers;

  /**
   * Constructs a new instance of the AlchemySignerClient.
   *
   * @param {ConnectionConfig} connectionConfig - The connection configuration containing the API key and other settings
   */
  constructor(connectionConfig: ConnectionConfig) {
    this.baseUrl = connectionConfig.rpcUrl ?? "https://api.g.alchemy.com";
    const headers = new Headers();
    headers.append("Alchemy-AA-Sdk-Version", VERSION);
    headers.append("Content-Type", "application/json");
    if (connectionConfig.apiKey) {
      headers.append("Authorization", `Bearer ${connectionConfig.apiKey}`);
    } else if (connectionConfig.jwt) {
      headers.append("Authorization", `Bearer ${connectionConfig.jwt}`);
    }
    this.headers = headers;
  }

  /**
   * Sends a POST request to the given signer route with the specified body and returns the response.
   * Not intended to be used directly in most cases. Use the specific methods instead.
   *
   * @param {SignerRoutes} route The route to which the request should be sent
   * @param {SignerBody<R>} body The request body containing the data to be sent
   * @returns {Promise<SignerResponse<R>>} A promise that resolves to the response from the signer
   */
  request = async <R extends SignerRoutes>(
    route: R,
    body: SignerBody<R>
  ): Promise<SignerResponse<R>> => {
    const response = await fetch(`${this.baseUrl}${this.basePath}${route}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const json = await response.json();

    return json as SignerResponse<R>;
  };

  /**
   * Retrieves the current user information using the provided stamped request.
   *
   * @param {TSignedRequest} stampedRequest A stamped whoami request
   * @returns {SignerResponse<"/v1/whoami">} A promise that resolves to the user object
   */
  whoami = async (
    stampedRequest: TSignedRequest
  ): Promise<SignerResponse<"/v1/whoami">> => {
    return this.request("/v1/whoami", { stampedRequest });
  };

  /**
   * Looks up a user by their email address.
   *
   * @param {string} email The email address to look up
   * @returns {SignerResponse<"/v1/lookup">} A promise that resolves to an orgId
   */
  lookup = async (email: string): Promise<SignerResponse<"/v1/lookup">> => {
    return this.request("/v1/lookup", { email });
  };

  /**
   * Signs a payload using the provided stamped request.
   *
   * @param {TSignedRequest} stampedRequest A stamped signature request
   * @returns {SignerResponse<"/v1/sign-payload">} A promise that resolves to the signed payload
   */
  signPayload = async (
    stampedRequest: TSignedRequest
  ): Promise<SignerResponse<"/v1/sign-payload">> => {
    return this.request("/v1/sign-payload", {
      stampedRequest,
    });
  };
}
