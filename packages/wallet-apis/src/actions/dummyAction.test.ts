import { local070Instance } from "~test/instances.js";
import { dummyAction } from "./dummyAction.js";

describe("dummyAction tests", async () => {
  const instance = local070Instance;

  it("should be able to call the dummyAction", async () => {
    const client = instance.getClient();

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
