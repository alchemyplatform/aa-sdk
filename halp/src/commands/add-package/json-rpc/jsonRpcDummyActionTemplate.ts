import dedent from "dedent";

export const jsonRpcDummyActionTemplate = () => dedent`
import type { Client, Chain, Account } from "viem";
import type { AlchemyTransport } from "@alchemy/common";

export type DummyActionParams<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined =
    | Account
    | undefined,
> = {
  chain: TChain;
  account: TAccount;
};

export type DummyActionResult = {};

export const dummyAction = async <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined =
    | Account
    | undefined,
>(client: Client<AlchemyTransport, TChain, TAccount>, params: DummyActionParams<TChain, TAccount>): Promise<DummyActionResult> => {
    console.log("dummyAction", client, params);
    return {};
};
`;
