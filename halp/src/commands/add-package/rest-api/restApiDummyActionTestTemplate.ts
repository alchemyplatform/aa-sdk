import dedent from "dedent";

export const restApiDummyActionTestTemplate = () => dedent`
import { localInstance } from "~test/instances.js";
import { dummyAction } from "./dummyAction.js";

describe("dummyAction tests", async () => {
 it("should be able to call the dummyAction", async () => {
  const client = localInstance.getClient();

  const result = await dummyAction(client, {
    param1: "foo",
    param2: 1,
  });

  expect(result).toEqual({
    success: true,
  });
 });
});
`;
