import * as AACoreModule from "@aa-sdk/core";
import { avalanche } from "viem/chains";
import { alchemy } from "./alchemyTransport.js";
import { sepolia } from "./chains.js";

describe("Alchemy Transport Tests", () => {
  it.each([
    { rpcUrl: "/api" },
    { jwt: "test" },
    { apiKey: "key" },
    { rpcUrl: "/api", jwt: "jwt" },
  ])("should successfully create a non-split transport", (args) => {
    expect(() =>
      alchemy({
        ...args,
      }),
    ).not.toThrowError();
  });

  it.each([
    { rpcUrl: "/api" },
    { jwt: "test" },
    { apiKey: "key" },
    { rpcUrl: "/api", jwt: "jwt" },
  ])("should correctly create a split transport", (args) => {
    const splitSpy = vi.spyOn(AACoreModule, "split");
    alchemy({
      alchemyConnection: args,
      nodeRpcUrl: "/test",
    })({ chain: sepolia });

    expect(splitSpy.mock.calls.length).toBe(1);
    expect(splitSpy.mock.calls[0]).toMatchSnapshot();
  });

  it("should correctly do runtime validation when chain is not supported by Alchemy", () => {
    expect(() => alchemy({ rpcUrl: "/test" })({ chain: avalanche }))
      .toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "custom",
          "message": "chain must include an alchemy rpc url. See \`createAlchemyChain\` or import a chain from \`@account-kit/infra\`.",
          "fatal": true,
          "path": []
        }
      ]]
    `);
  });
});
