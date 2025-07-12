import { avalanche } from "viem/chains";
import { sepolia } from "../chains.js";
import { alchemy } from "./alchemy.js";
import * as SplitModule from "./split.js";

describe("Alchemy Transport Tests", () => {
  it.each([{ proxyUrl: "/api" }, { jwt: "test" }, { apiKey: "key" }])(
    "should successfully create a non-split transport",
    (args) => {
      expect(() =>
        alchemy({
          ...args,
        }),
      ).not.toThrowError();
    },
  );

  it.each([{ proxyUrl: "/api" }, { jwt: "test" }, { apiKey: "key" }])(
    "should correctly create a split transport",
    (args) => {
      const splitSpy = vi.spyOn(SplitModule, "split");
      alchemy({
        alchemyConnection: args,
        nodeRpcUrl: "/test",
      })({ chain: sepolia });

      expect(splitSpy.mock.calls.length).toBe(1);
      expect(splitSpy.mock.calls[0]).toMatchSnapshot();
    },
  );

  it("should correctly do runtime validation when chain is not supported by Alchemy", () => {
    expect(() =>
      alchemy({ apiKey: "some_key" })({ chain: avalanche }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: chain must include an alchemy rpc url. See \`defineAlchemyChain\` or import a chain from \`@alchemy/common/chains\`.]`,
    );
  });
});
