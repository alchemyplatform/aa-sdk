import type { PartialBy } from "viem/chains";
import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import type { AlchemySignerClient } from "../../signer/index.js";
import {
  AlchemySigner,
  type AlchemySignerParams,
} from "../../signer/signer.js";
import { AlchemySignerStatus } from "../../signer/types.js";
import { DEFAULT_IFRAME_CONTAINER_ID } from "../createConfig.js";
import type { SupportedAccountTypes } from "../types.js";
import type {
  AccountState,
  ClientState,
  ClientStore,
  SignerStatus,
} from "./types.js";

export type CreateClientStoreParams = {
  client: PartialBy<
    Exclude<AlchemySignerParams["client"], AlchemySignerClient>,
    "iframeConfig"
  >;
  sessionConfig?: AlchemySignerParams["sessionConfig"];
};

export const createClientStore = (config: CreateClientStoreParams) => {
  const clientStore =
    typeof window === "undefined"
      ? undefined
      : createStore(
          subscribeWithSelector(() => createInitialClientState(config))
        );

  addClientSideStoreListeners(clientStore);

  return clientStore;
};

const createSigner = (params: CreateClientStoreParams) => {
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

  const signer = new AlchemySigner({
    client: {
      ...client,
      iframeConfig: {
        ...client.iframeConfig,
        iframeContainerId,
      },
    },
    sessionConfig,
  });

  const search = new URLSearchParams(window.location.search);
  if (search.has("bundle")) {
    signer.authenticate({ type: "email", bundle: search.get("bundle")! });
  }

  return signer;
};

const getSignerStatus = (
  alchemySignerStatus: AlchemySignerStatus
): SignerStatus => ({
  status: alchemySignerStatus,
  isInitializing: alchemySignerStatus === AlchemySignerStatus.INITIALIZING,
  isAuthenticating:
    alchemySignerStatus === AlchemySignerStatus.AUTHENTICATING ||
    alchemySignerStatus === AlchemySignerStatus.AWAITING_EMAIL_AUTH,
  isConnected: alchemySignerStatus === AlchemySignerStatus.CONNECTED,
  isDisconnected: alchemySignerStatus === AlchemySignerStatus.DISCONNECTED,
});

// This is done this way to avoid issues with React requiring static state
const staticState: AccountState<SupportedAccountTypes> = {
  status: "DISCONNECTED",
  account: undefined,
};

export const defaultAccountState = <
  T extends SupportedAccountTypes
>(): AccountState<T> => staticState;

const createInitialClientState = (
  params: CreateClientStoreParams
): ClientState => {
  const signer = createSigner(params);

  return {
    signer,
    signerStatus: getSignerStatus(AlchemySignerStatus.INITIALIZING),
    accounts: {
      LightAccount: defaultAccountState<"LightAccount">(),
      MultiOwnerModularAccount:
        defaultAccountState<"MultiOwnerModularAccount">(),
    },
  };
};

const addClientSideStoreListeners = (store?: ClientStore) => {
  if (store == null) {
    return;
  }

  store.subscribe(
    ({ signer }) => signer,
    (signer) => {
      signer.on("statusChanged", (status) => {
        console.log("statusChanged", status);
        store.setState({ signerStatus: getSignerStatus(status) });
      });
      signer.on("connected", (user) => {
        console.log("connected", user);
        store.setState({ user });
      });
      signer.on("disconnected", () => {
        console.log("disconnected");
        store.setState({
          user: undefined,
          accounts: {
            LightAccount: { status: "DISCONNECTED", account: undefined },
            MultiOwnerModularAccount: {
              status: "DISCONNECTED",
              account: undefined,
            },
          },
        });
      });
    },
    { fireImmediately: true }
  );
};
