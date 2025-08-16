import dedent from "dedent";

export const jsonRpcDummyActionTestTemplate = () => dedent`
import { local070Instance } from "~test/instances.js";
import { dummyAction } from "./dummyAction.js";

describe("dummyAction tests", async () => {
 const instance = local070Instance;

 it("should be able to call the dummyAction", async () => {
  const client = instance.getClient();

  const result = await dummyAction(client, {
    chain: client.chain,
    account: "0x0000000000000000000000000000000000000000",
  });
 });
});
`;
