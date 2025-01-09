"use client";

import { Button } from "../Button";
// import {
//     useSmartAccountClient,
//   } from "@account-kit/react";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient } from "viem";
import {
  createBundlerClientFromExisting,
  LocalAccountSigner,
} from "@aa-sdk/core";
import { mekong, splitMekongTransport } from "./transportSetup";
import { send7702UO } from "./demoSend7702UO";
import { useSigner } from "@account-kit/react";

export const Debug7702Button = () => {
  // const { client, address, isLoadingClient } = useSmartAccountClient({
  //   type: "LightAccount",
  //   });

  const signer = useSigner();

  const runFunc = async (local: boolean) => {
    const publicClient = createPublicClient({
      chain: mekong,
      transport: splitMekongTransport,
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
        splitMekongTransport,
        new LocalAccountSigner(localAccount)
      );
    } else {
      if (!signer) {
        console.error("No signer found");
        return;
      }
      send7702UO(bundlerClient, splitMekongTransport, signer);
    }
  };

  const runLocal = () => runFunc(true);
  const runSigner = () => runFunc(false);

  return (
    <div>
      <Button onClick={runLocal}>Debug 7702 local</Button>
      <Button onClick={runSigner}>Debug 7702 signer</Button>
    </div>
  );
};
