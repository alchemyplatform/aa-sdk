import { AlchemyWebSigner } from "@account-kit/signer";
import { DEFAULT_IFRAME_CONTAINER_ID } from "../../createConfig.js";
import type { ClientStoreConfig } from "../../store/types";

/**
 * Given initial client store parameters, it initializes an AlchemySigner instance.
 * This should only be called on the client.
 *
 * @param {CreateClientStoreParams} params to configure and create the signer
 * @returns {AlchemySigner} an instance of the AlchemySigner
 */
export const createSigner = (params: ClientStoreConfig) => {
  const { client, sessionConfig } = params;
  const { iframeContainerId } = client.iframeConfig ?? {
    iframeContainerId: DEFAULT_IFRAME_CONTAINER_ID,
  };

  let iframeContainer = document.getElementById(iframeContainerId);
  if (iframeContainer !== null) {
    iframeContainer.innerHTML = "";
    iframeContainer.style.display = "none";
  } else {
    iframeContainer = document.createElement("div");
    iframeContainer.id = iframeContainerId;
    iframeContainer.style.display = "none";
    document.body.appendChild(iframeContainer);
  }

  const signer = new AlchemyWebSigner({
    client: {
      ...client,
      iframeConfig: {
        ...client.iframeConfig,
        iframeContainerId,
      },
    },
    sessionConfig,
  });

  if (client.enablePopupOauth) {
    signer.preparePopupOauth();
  }

  return signer;
};
