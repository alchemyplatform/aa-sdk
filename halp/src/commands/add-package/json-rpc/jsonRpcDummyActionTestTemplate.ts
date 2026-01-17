import dedent from "dedent";

export const jsonRpcDummyActionTestTemplate = () => dedent`
import { localInstance } from "~test/instances.js";
import { dummyAction } from "./dummyAction.js";

describe("dummyAction tests", async () => {
 it("should be able to call the dummyAction", async () => {
  const client = localInstance.getClient();

  const result = await dummyAction(client, {
    firstParam: {
      param1: "foo",
      param2: 1,
    },
    secondParam: "bar",
  });

  expect(result).toEqual({
    success: true,
  });
 });
});
`;
