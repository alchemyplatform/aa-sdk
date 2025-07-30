import {
  dummyAction,
  type DummyActionParams,
  type DummyActionResult,
} from "./actions/dummyAction.js";
import type { AlchemyTransport } from "@alchemy/common";
import type { Client, Chain, Account } from "viem";

export type TODO_MyActions = {
  dummyAction: (params: DummyActionParams) => Promise<DummyActionResult>;
};

/**
 * This is a decorator that is used to add actions to a client.
 *
 * @param {object} client - The client to add the actions to.
 * @returns {object} - The client with the actions added.
 */
export const TODO_myActions: <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  client: Client<AlchemyTransport, TChain, TAccount>,
) => TODO_MyActions = (client) => ({
  dummyAction: (params) => dummyAction(client, params),
});
