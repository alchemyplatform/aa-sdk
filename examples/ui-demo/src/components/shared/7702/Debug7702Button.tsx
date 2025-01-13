"use client";

import { Button } from "../Button";
// import {
//     useSmartAccountClient,
//   } from "@account-kit/react";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, toRlp, fromRlp } from "viem";
import {
  createBundlerClientFromExisting,
  LocalAccountSigner,
} from "@aa-sdk/core";
import { odyssey, splitOdysseyTransport } from "./transportSetup";
import { send7702UO } from "./demoSend7702UO";
import { useSigner } from "@account-kit/react";

export const Debug7702Button = () => {
  // const { client, address, isLoadingClient } = useSmartAccountClient({
  //   type: "LightAccount",
  //   });

  const signer = useSigner();

  const runFunc = async (local: boolean) => {
    const publicClient = createPublicClient({
      chain: odyssey,
      transport: splitOdysseyTransport,
    });

    // console.log("reported chain id: ", await publicClient.getChainId());

    // console.log(
    //   "reported balance: ",
    //   await publicClient.getBalance({ address: localAccount.address })
    // );

    const bundlerClient = createBundlerClientFromExisting(publicClient);

    // console.log(
    //   "supported entry points: ",
    //   await bundlerClient.getSupportedEntryPoints()
    // );

    // const tprt = splitMekongTransport({ chain: mekong });

    // const res = tprt.request({
    //   method: "rundler_maxPriorityFeePerGas",
    //   params: [],
    // });

    // console.log("maxPriorityFeePerGas: ", await res);

    // send7702UO(bundlerClient, splitMekongTransport, new LocalAccountSigner(localAccount));

    if (local) {
      // Addr: 0xdF0C33fe84BEBdcbd1029E95295AC4D2A7Ca0f7a
      // pkey: 0x18bec901c0253fbb203d3423dada59eb720c68f34935185de43d161b0524404b
      const localAccount = privateKeyToAccount(
        "0x18bec901c0253fbb203d3423dada59eb720c68f34935185de43d161b0524404b"
      );

      send7702UO(
        bundlerClient,
        splitOdysseyTransport,
        new LocalAccountSigner(localAccount)
      );
    } else {
      if (!signer) {
        console.error("No signer found");
        return;
      }
      send7702UO(bundlerClient, splitOdysseyTransport, signer);
    }
  };

  const runLocal = () => runFunc(true);
  const runSigner = () => runFunc(false);

  const rlpEncode = () => {
    const chain_id = "0xde9fb";
    const address = "0x69007702764179f14f51cdce752f4f775d74e139";
    const nonce = "0x";
    const yParity = "0x1c";
    const r =
      "0x2943f6154757e02a7c8264f9c2f79fac321beef60578746c61eb84a5fc4525d7";
    const s =
      "0x6a23e53538e028c06f5b149e33424ea11358eecec44ecd8819fbf67ceb03a957";

    // // result:     0xf85d830de9fb9469007702764179f14f51cdce752f4f775d74e1390001a02943f6154757e02a7c8264f9c2f79fac321beef60578746c61eb84a5fc4525d7a06a23e53538e028c06f5b149e33424ea11358eecec44ecd8819fbf67ceb03a957
    // // result 2:   0xf85ff85d830de9fb9469007702764179f14f51cdce752f4f775d74e1390001a02943f6154757e02a7c8264f9c2f79fac321beef60578746c61eb84a5fc4525d7a06a23e53538e028c06f5b149e33424ea11358eecec44ecd8819fbf67ceb03a957
    // // ext result: 0xf85d830de9fb9470d37dc45141e10c42f27e432458218ed4e1aab78080a084039480ba511822433b50a1dea5738e7a946ba187172c02f00076e4a87545a1a001dc4c5f78b6c81f5a695ee8725346a45bf9d1d1f7c1437532efd31a9769fda5

    // const chain_id = "0xde9fb";
    // const address = "0x69007702764179f14f51cdce752f4f775d74e139";
    // const nonce = "0x0";
    // const yParity = "0x1c";
    // const r = "0x2943f6154757e02a7c8264f9c2f79fac321beef60578746c61eb84a5fc4525d7";
    // const s = "0x6a23e53538e028c06f5b149e33424ea11358eecec44ecd8819fbf67ceb03a957";

    // // result:     0xf85d830de9fb9469007702764179f14f51cdce752f4f775d74e139001ca02943f6154757e02a7c8264f9c2f79fac321beef60578746c61eb84a5fc4525d7a06a23e53538e028c06f5b149e33424ea11358eecec44ecd8819fbf67ceb03a957

    const encoded = toRlp([chain_id, address, nonce, yParity, r, s]);

    console.log("encoded: ", encoded);
  };

  const rlpDecode = () => {
    // const input = "0xf85d830de9fb9470d37dc45141e10c42f27e432458218ed4e1aab78080a084039480ba511822433b50a1dea5738e7a946ba187172c02f00076e4a87545a1a001dc4c5f78b6c81f5a695ee8725346a45bf9d1d1f7c1437532efd31a9769fda5";

    // From cast sign-auth with the local pkey
    const input =
      "0xf85d830de9fb9469007702764179f14f51cdce752f4f775d74e1398080a07e650c48b0033a147681165efb7fe9b6195f64f41f71f4b8e503657fd57c3609a00ad5d521d5bbfdcda9d3b9d7b9790cd6ed695d7d63ec08ef49de9631ea0e9b25";

    // result:

    console.log(fromRlp(input));
  };

  return (
    <div>
      <Button onClick={runLocal}>Debug 7702 local</Button>
      <Button onClick={runSigner}>Debug 7702 signer</Button>
      <Button onClick={rlpEncode}>RLP encode</Button>
      <Button onClick={rlpDecode}>RLP decode</Button>
    </div>
  );
};
