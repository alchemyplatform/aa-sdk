import getPort from "get-port";
import { createServer } from "prool";
import { anvil } from "prool/instances";
import { rundlerBinaryPath } from "../constants";
import { rundler, type RundlerParameters } from "./instance";

describe("instance: 'rundler'", async () => {
  const port = await getPort();

  beforeAll(async () => {
    await anvil({ port }).start();
  });

  test("request: /{id}", async () => {
    const server = createServer({
      instance: rundler(rundlerOptions({ port })),
    });
    const stop = await server.start();
    const { port: port_2 } = server.address()!;

    const response = await fetch(`http://localhost:${port_2}/1`, {
      body: JSON.stringify({
        method: "eth_supportedEntryPoints",
        params: [],
        id: 0,
        jsonrpc: "2.0",
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchInlineSnapshot(`
        {
          "id": 0,
          "jsonrpc": "2.0",
          "result": [
            "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
            "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
          ],
        }
      `);
    await stop();
  });
});

export const rundlerOptions = ({
  port,
}: {
  port: number;
}): RundlerParameters => ({
  binary: rundlerBinaryPath,
  nodeHttp: `http://localhost:${port}`,
  rpc: {
    api: "eth,rundler,debug",
  },
  signer: {
    privateKeys: [
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    ],
  },
});
