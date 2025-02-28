"use client";

import {
  type AlchemyAccountsConfig,
  type AlchemyClientState,
  type AlchemySigner,
} from "@account-kit/core";
import { hydrate } from "@account-kit/core";
import { useEffect, useRef, type PropsWithChildren } from "react";

export type HydrateProps = {
  config: AlchemyAccountsConfig<AlchemySigner>;
  initialState?: AlchemyClientState<AlchemySigner>;
};

/**
 * A react component that can be used to hydrate the client store with the provided initial state.
 * This method will use `hydrate` to hydrate the client store with the provided initial state if one is provided.
 * If ssr is set on the account config, then it will run the onMount function within a useEffect hook. Otherwise,
 * It will run onMount as soon as the compoonent is rendered.
 *
 * based on https://github.com/wevm/wagmi/blob/main/packages/react/src/hydrate.ts
 *
 * @param {PropsWithChildren<HydrateProps>} props component props containing the config and initial state as well as children to render
 * @param {AlchemyAccountsConfig} props.config the account config containing the client store
 * @param {AlchemyClientState | undefined} props.initialState optional param detailing the initial ClientState
 * @param {React.ReactNode} props.children the children to render
 * @returns {React.ReactNode} the children to render
 */
export function Hydrate(props: PropsWithChildren<HydrateProps>) {
  const { children, config, initialState } = props;

  const { onMount } = hydrate(config, initialState);

  // Hydrate for Non-SSR
  if (!config._internal.ssr) {
    onMount();
  }

  // Hydrate for SSR
  const active = useRef(true);
  useEffect(() => {
    if (!active.current) return;
    if (!config._internal.ssr) return;
    onMount();
    return () => {
      active.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}
