import axios from "axios";
import { OwnedNFTsResponse } from "../declarations/api";

export async function callEndpoint<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  params?: Record<string, any>
): Promise<T> {
  try {
    switch (method) {
      case "GET":
        return axios
          .get(endpoint, {
            params,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })
          .then((r) => r.data);
      case "POST":
        return axios
          .post(endpoint, params, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })
          .then((r) => r.data);
      case "PUT":
        return axios
          .put(endpoint, params, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          })
          .then((r) => r.data);
      case "DELETE":
        return axios.delete(endpoint, {
          params,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      default:
        throw new Error(`${method} was not never`);
    }
  } catch (error: any) {
    if (!error.isAxiosError) {
      throw new Error(`Unknown Error: ${error}`);
    }
    const { response } = error;
    if (!response) {
      throw new Error("Could not reach server.");
    }
    throw new Error(
      response.data
        ? (response.data as { error: string })["error"]
        : "Server error."
    );
  }
}
