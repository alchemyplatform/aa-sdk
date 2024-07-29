import { http, zeroAddress } from "viem";

import { arbitrumSepolia } from "@account-kit/infra";

import { LocalAccountSigner } from "@aa-sdk/core";

import {
    API_KEY,
    RI_6900_ACCOUNT_OWNER_MNEMONIC,
  } from "./constants.js";


import {
    createSingleSignerRIAccountClient,
    type CreateSingleSignerRIAccountClientParams,
} from "../src/index.js";


const chain = arbitrumSepolia;

const transport = http("https://arb-sepolia.g.alchemy.com/v2/" + API_KEY);

describe("6900 RI Account Tests", async () => {
    const signer1 = LocalAccountSigner.mnemonicToAccountSigner(
        RI_6900_ACCOUNT_OWNER_MNEMONIC,
        { accountIndex: 0 }
    );

    const owner1 = await signer1.getAddress();

    it("should successfully get counterfactual address", async () => {
        const {
            account: { address },
        } = await givenConnectedProvider({
            signer: signer1,
            chain,
            transport,
        });

        expect(address).toMatchInlineSnapshot(
            '"0x16D3b5139De103C46EFce3Cbf5B582edF4a75710"'
        );
    });

    it("should execute successfully", async () => {
        const provider = await givenConnectedProvider({
            signer: signer1,
            chain,
            transport,
        });

        const result = await provider.sendUserOperation({
            uo: {
                target: zeroAddress,
                data: "0x",
            },
            overrides: {
                maxPriorityFeePerGas: 6000000,
            }
        });

        const txnHash = provider.waitForUserOperationTransaction(result);

        await expect(txnHash).resolves.not.toThrowError();

    }, 100000);


});


const givenConnectedProvider = async ({
    chain,
    signer,
    accountAddress,
    transport,
    ...config
  }: CreateSingleSignerRIAccountClientParams) =>
    createSingleSignerRIAccountClient({
      chain,
      signer,
      accountAddress,
      transport,
      opts: {
        txMaxRetries: 10,
        ...config.opts,
        feeOptions: {
          maxFeePerGas: { multiplier: 1.8 },
          maxPriorityFeePerGas: { multiplier: 1.5 },
          ...config.opts?.feeOptions,
        },
      },
    });

