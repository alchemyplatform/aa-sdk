import dedent from "dedent";

export const jsonRpcDummyActionTemplate = () => dedent`
import type { Client, Chain, Account } from "viem";
import type { AlchemyTransport } from "@alchemy/common";
import type { TODO_MyRpcSchema } from "./schema.js";

export type DummyActionParams<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined =
    | Account
    | undefined,
> = {
  firstParam: {
    param1: string;
    param2: number;
  };
  secondParam: string;
};

export type DummyActionResult = {
  success: boolean;
};

/**
 * This is a dummy action that is used to test the decorator.
 * @param client - The client to add the actions to.
 * @param params - The parameters for the action.
 * @returns The result of the action.
 */
export const dummyAction = async <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined =
    | Account
    | undefined,
>(client: Client<AlchemyTransport<TODO_MyRpcSchema>, TChain, TAccount>, params: DummyActionParams<TChain, TAccount>): Promise<DummyActionResult> => {
    return client.transport.request({
      method: "TODO_MyMethod",
      params: [params.firstParam, params.secondParam]
    });
};
`;
