import type { AlchemyConfig } from "@alchemy/wagmi-core";
import type {
  DefaultError,
  QueryKey,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { Compute, ExactPartial, Omit } from "@wagmi/core/internal";
import type { ReactNode } from "react";
import type { AuthType } from "./components/auth/types";

export type ConfigParameter = {
  config?: AlchemyConfig | undefined;
};

export type AlchemyAccountsUIConfig = {
  auth?: {
    /**
     * If this is true, then auth components will prompt users to add
     * a passkey after signing in for the first time
     */
    addPasskeyOnSignup?: boolean;
    header?: ReactNode;
    /**
     * If hideError is true, then the auth component will not
     * render the global error component
     */
    hideError?: boolean;
    onAuthSuccess?: () => void;
    /**
     * Each section can contain multiple auth types which will be grouped together
     * and separated by an OR divider
     */
    sections: AuthType[][];
    /**
     * Whether to show the "Sign in" header text in the first auth step
     */
    hideSignInText?: boolean;
  };
  illustrationStyle?: "outline" | "linear" | "filled" | "flat" | undefined;
  /**
   * This class name will be applied to any modals that are rendered
   */
  modalBaseClassName?: string;
  /**
   * This is the URL that will be used to link to the support page
   */
  supportUrl?: string | undefined;
  /**
   * Set to "embedded" if the auth component will be rendered within a parent
   * component in your UI. The default "modal" should be used if the auth component will be rendered in a modal overlay.
   */
  uiMode?: "modal" | "embedded";
};

export type AuthIllustrationStyle = NonNullable<
  AlchemyAccountsUIConfig["illustrationStyle"]
>;

// From wagmi.
export type QueryParameter<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = {
  query?:
    | Omit<
        UseQueryParameters<queryFnData, error, data, queryKey>,
        "queryFn" | "queryHash" | "queryKey" | "queryKeyHashFn" | "throwOnError"
      >
    | undefined;
};

// From wagmi.
export type UseQueryParameters<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = Compute<
  ExactPartial<
    Omit<UseQueryOptions<queryFnData, error, data, queryKey>, "initialData">
  > & {
    // Fix `initialData` type
    initialData?:
      | UseQueryOptions<queryFnData, error, data, queryKey>["initialData"]
      | undefined;
  }
>;
