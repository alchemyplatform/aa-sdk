import { getCookie, removeCookie, setCookie } from "typescript-cookie";
import { DEFAULT_SESSION_MS } from "../../signer/session/manager.js";
import type { AlchemyAccountsConfig, AlchemyClientState } from "../types";
import { deserialize } from "./deserialize.js";

/**
 * Function to create cookie based Storage
 *
 * @param config optional config object that allows you to set the session length
 * @returns an instance of a browser storage object that leverages cookies
 */
export const cookieStorage: (config?: { sessionLength: number }) => Storage = (
  config
) => ({
  // this is unused for now, we should update this if we do need it
  length: 0,

  clear: function (): void {
    if (typeof document === "undefined") return;

    document.cookie = "";
  },

  getItem: function (key: string): string | null {
    if (typeof document === "undefined") return null;

    const cookieValue = getCookie(key);
    return cookieValue ? deserialize(cookieValue) : null;
  },

  // we will not be using this, if we have need for it add it back later
  key: function (): string | null {
    throw new Error("Function not implemented.");
  },

  removeItem: function (key: string): void {
    if (typeof document === "undefined") return;

    removeCookie(key);
  },

  setItem: function (key: string, value: string): void {
    if (typeof document === "undefined") return;

    setCookie(key, value, {
      expires: new Date(
        Date.now() + (config?.sessionLength ?? DEFAULT_SESSION_MS)
      ),
    });
  },
});

/**
 * Converts a cookie into an initial state object
 *
 * @param config the account config containing the client store
 * @param cookie optional cookie string
 * @returns the deserialized AlchemyClientState if the cookie exists, otherwise undefined
 */
export function cookieToInitialState(
  config: AlchemyAccountsConfig,
  cookie?: string
): AlchemyClientState | undefined {
  if (!cookie) return;

  const state = parseCookie(cookie, config._internal.storageKey);
  if (!state) return;

  return deserialize<{ state: AlchemyClientState }>(state).state;
}

/**
 * Helper function that can be used to parse a cookie string on the server or client
 *
 * @param cookie the cookie string to parse
 * @param key the key of the cookie to parse
 * @returns the value of the cookie given a key if it exists, otherwise undefined
 */
export function parseCookie(cookie: string, key: string) {
  const keyValue = cookie.split("; ").find((x) => x.startsWith(`${key}=`));
  if (!keyValue) return undefined;
  return keyValue.substring(key.length + 1);
}
