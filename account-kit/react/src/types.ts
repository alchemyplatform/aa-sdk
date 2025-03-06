import type { UseMutationOptions } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { AuthType } from "./components/auth/types.js";

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
};

export type AuthIllustrationStyle = NonNullable<
  AlchemyAccountsUIConfig["illustrationStyle"]
>;

/**
 * Base hook mutation arguments.
 *
 * @template TData The mutation data type.
 * @template TVariable The mutation variable type.
 */
export type BaseHookMutationArgs<
  TData extends any = void,
  TVariable extends any = void,
> = Partial<
  Omit<
    UseMutationOptions<TData, Error, TVariable, unknown>,
    "mutationFn" | "mutationKey"
  >
>;
