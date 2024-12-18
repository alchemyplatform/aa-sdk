"use client";

import { Button } from "../Button";
// import {
//     useSmartAccountClient,
//   } from "@account-kit/react";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient } from "viem";
import { createBundlerClientFromExisting } from "@aa-sdk/core";
import { mekong, splitMekongTransport } from "./transportSetup";
import { send7702UO } from "./demoSend7702UO";

export const Debug7702Button = () => {
  // const { client, address, isLoadingClient } = useSmartAccountClient({
  //   type: "LightAccount",
  //   });

  const runFunc = async () => {
    // Addr: 0xdF0C33fe84BEBdcbd1029E95295AC4D2A7Ca0f7a
    // pkey: 0x18bec901c0253fbb203d3423dada59eb720c68f34935185de43d161b0524404b
    const localAccount = privateKeyToAccount(
      "0x18bec901c0253fbb203d3423dada59eb720c68f34935185de43d161b0524404b"
    );

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

    send7702UO(bundlerClient, splitMekongTransport, localAccount);
  };

  return <Button onClick={runFunc}>Debug 7702</Button>;
};
