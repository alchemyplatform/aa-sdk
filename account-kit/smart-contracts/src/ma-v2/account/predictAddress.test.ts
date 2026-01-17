import {
  getAccountAddress,
  getEntryPoint,
  LocalAccountSigner,
} from "@aa-sdk/core";
import { custom, publicActions } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { localInstance } from "~test/instances.js";
import { createModularAccountV2 } from "./modularAccountV2.js";
import { predictModularAccountV2Address } from "./predictAddress.js";
import {
  getDefaultMAV2FactoryAddress,
  getDefaultSMAV2BytecodeAddress,
} from "../utils.js";

describe("MAv2 Counterfactual Address Tests", () => {
  it("MAv2 should match the entrypoint generated counterfactual address", async () => {
    // Repeat 20 times, with a randomized address and salt. Pseudo-fuzzing.

    for (let i = 0; i < 20; i++) {
      const localSigner =
        LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());

      // Generate a random salt. The same generator function for private keys can be used, because it is also a 32 byte value.
      const salt = BigInt(generatePrivateKey());

      const chain = localInstance.chain;
      const entryPoint = getEntryPoint(chain, {
        version: "0.7.0",
      });

      const modularAccountV2 = await createModularAccountV2({
        transport: custom(localInstance.getClient()),
        signer: localSigner,
        chain,
        salt,
        mode: "default",
      });

      // First, compute the address using the EntryPoint utility function:
      const entryPointComputedAddress = await getAccountAddress({
        client: localInstance.getClient().extend(publicActions),
        entryPoint,
        getAccountInitCode: modularAccountV2.getInitCode,
      });

      const locallyComputedAddress = predictModularAccountV2Address({
        factoryAddress: getDefaultMAV2FactoryAddress(chain),
        implementationAddress: getDefaultSMAV2BytecodeAddress(chain),
        salt,
        type: "SMA",
        ownerAddress: await localSigner.getAddress(),
      });

      expect(entryPointComputedAddress).toEqual(locallyComputedAddress);
    }
  });
});
