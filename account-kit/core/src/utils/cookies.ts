import { DEFAULT_SESSION_MS } from "@account-kit/signer";
import { cookieToInitialState as wagmiCookieToInitialState } from "@wagmi/core";
import Cookies from "js-cookie";
import type { StoredState } from "../store/types.js";
import type { AlchemyAccountsConfig } from "../types.js";
import { deserialize } from "./deserialize.js";

/**
 * Function to create cookie based Storage
 *
 * @param {{sessionLength: number; domain?: string}} config optional config object that allows you to set the session length
 * @param {number} config.sessionLength the length of the session in milliseconds
 * @param {string} config.domain optional domain to set the cookie on, eg: `example.com` if you want the cookie to work on all subdomains of example.com
 * @returns {Storage} an instance of a browser storage object that leverages cookies
 */
export const cookieStorage = (config?: {
  sessionLength?: number;
  domain?: string;
}): Storage => ({
  // this is unused for now, we should update this if we do need it
  length: 0,

  clear: function (): void {
    throw new Error(
      "clearing cookies is not supported as this could lead to unexpected behaviour.\n" +
        " Use removeItem instead or you can manually clear cookies with document.cookie = ''"
    );
  },

  getItem: function (key: string): string | null {
    if (typeof document === "undefined") return null;

    const cookieValue = Cookies.get(key);
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  },

  // we will not be using this, if we have need for it add it back later
  key: function (): string | null {
    throw new Error("Function not implemented.");
  },

  removeItem: function (key: string): void {
    if (typeof document === "undefined") return;

    Cookies.remove(key);
  },

  setItem: function (key: string, value: string): void {
    if (typeof document === "undefined") return;

    Cookies.set(key, value, {
      expires: new Date(
        Date.now() + (config?.sessionLength ?? DEFAULT_SESSION_MS)
      ),
      domain: config?.domain,
    });
  },
});

/**
 * Converts a cookie into an initial state object
 *
 * @param {AlchemyAccountsConfig} config the account config containing the client store
 * @param {string | undefined} cookie optional cookie string
 * @returns {StoredState | undefined} the deserialized AlchemyClientState if the cookie exists, otherwise undefined
 */
export function cookieToInitialState(
  config: AlchemyAccountsConfig,
  cookie?: string
): StoredState | undefined {
  if (!cookie) return;

  const state = parseCookie(cookie, config._internal.storageKey);
  if (!state) return;

  const alchemyClientState = deserialize<{
    state: StoredState["alchemy"];
  }>(state).state;

  const wagmiClientState = wagmiCookieToInitialState(
    config._internal.wagmiConfig,
    decodeURIComponent(cookie)
  );

  return {
    alchemy: alchemyClientState,
    wagmi: wagmiClientState,
  };
}

/**
 * Helper function that can be used to parse a cookie string on the server or client
 *
 * @param {string} cookie the cookie string to parse
 * @param {string} key the key of the cookie to parse
 * @returns {string} the value of the cookie given a key if it exists, otherwise undefined
 */
export function parseCookie(cookie: string, key: string) {
  const keyValue = cookie.split("; ").find((x) => x.startsWith(`${key}=`));
  if (!keyValue) return undefined;
  return keyValue.substring(key.length + 1);
}
