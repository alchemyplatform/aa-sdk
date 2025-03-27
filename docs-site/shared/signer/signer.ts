import { AlchemyWebSigner } from "@account-kit/signer";

export const signer = new AlchemyWebSigner({
  client: {
    connection: {
      apiKey: "API_KEY",
    },
    iframeConfig: {
      iframeContainerId: "alchemy-signer-iframe-container",
    },
  },
});
