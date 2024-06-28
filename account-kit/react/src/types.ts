import type { UseMutationOptions } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { AuthType } from "./components/auth/types.js";

export type AlchemyAccountsUIConfig = {
  header?: ReactNode;
  showSignInText?: boolean;
  illustrationStyle?: "outline" | "linear" | "filled" | "flat";
  /**
   * Each section can contain multiple auth types which will be grouped together
   * and separated by an OR divider
   */
  sections?: AuthType[][];
  /**
   * This class name will be applied to the modal if it is used
   */
  modalClassName?: string;
  onAuthSuccess?: () => void;
  addPasskeyOnSignup?: boolean;
  /**
   * If hideError is true, then the auth component will not
   * render the global error component
   */
  hideError?: boolean;
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
  TVariable extends any = void
> = Partial<
  Omit<
    UseMutationOptions<TData, Error, TVariable, unknown>,
    "mutationFn" | "mutationKey"
  >
>;
