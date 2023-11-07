import { Chain, HttpTransportConfig, custom, http } from "viem";

export const customTransport = (
  chain: Chain,
  rpcUrl: string,
  fetchOptions?: HttpTransportConfig["fetchOptions"]
) =>
  custom({
    async request({ method, params }) {
      switch (method) {
        case "alchemy_getNftsForOwner":
          return nftTransport(
            "getNftsForOwner",
            "nft",
            params[0],
            rpcUrl,
            fetchOptions
          );
        default:
          return httpTransport(chain, rpcUrl, fetchOptions).request({
            method,
            params,
          });
      }
    },
  });

export const httpTransport = (
  chain: Chain,
  rpcUrl: string,
  fetchOptions?: HttpTransportConfig["fetchOptions"]
) =>
  http(rpcUrl, {
    fetchOptions: {
      ...fetchOptions,
      headers: {
        ...fetchOptions?.headers,
      },
    },
  })({ chain });

export const nftTransport = async (
  apiName: string,
  namespace: string,
  body: Object,
  rpcUrl: string,
  fetchOptions?: HttpTransportConfig["fetchOptions"]
) => {
  const { origin, pathname } = new URL(rpcUrl);
  const nftRestUrl = `${origin}/${namespace}${pathname}/${apiName}`;

  const res = await fetch(nftRestUrl, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      ...fetchOptions?.headers,
    },
  });

  return res.json();
};
