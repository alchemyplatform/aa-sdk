import dedent from "dedent";

export const restApiDummyActionTemplate = () => dedent`
import type { Client, Chain, Account } from "viem";
import type { AlchemyTransport } from "@alchemy/common";
import type { TODO_MyHttpSchema } from "../schema.js";

export type DummyActionParams = {
    param1: string;
    param2: number;
}

export type DummyActionResult = {
    success: boolean;
}

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
>(client: Client<AlchemyTransport<undefined, TODO_MyHttpSchema>, TChain, TAccount>, params: DummyActionParams): Promise<DummyActionResult> => {
    return client.transport.makeHttpRequest({
      method: "POST",
      route: "TODO_MyRoute",
      body: params
    });
};
`;
