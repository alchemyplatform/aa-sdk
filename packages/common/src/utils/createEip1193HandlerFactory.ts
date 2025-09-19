/**
 * Creates a typed handler factory for EIP1193 request methods.
 * This helps with Viem's typing within custom EIP1193 request functions by
 * automatically casting input params and ensuring the result matches what is required.
 *
 * @returns {(params: unknown) => unknown} A function that creates a handler factory for specific methods
 */
export const createEip1193HandlerFactory =
  <
    TMethods extends readonly {
      Method: string;
      Parameters?: unknown;
      ReturnType?: unknown;
    }[],
  >() =>
  <TMethod extends TMethods[number]["Method"]>(
    handle: (
      params: Extract<TMethods[number], { Method: TMethod }>["Parameters"],
    ) => Promise<Extract<TMethods[number], { Method: TMethod }>["ReturnType"]>,
  ) =>
  (params: unknown) => {
    return handle(
      params as Extract<TMethods[number], { Method: TMethod }>["Parameters"],
    );
  };
