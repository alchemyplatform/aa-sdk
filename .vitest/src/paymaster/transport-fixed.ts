// This is a modified version of the transport that ensures paymaster is deployed
import { custom } from "viem";
import { paymaster060 } from "./paymaster060";
import { paymaster070 } from "./paymaster070";

export const createPaymasterTransport = (client: any) => {
  const deployedPaymasters = new Set<string>();

  return custom({
    async request(args: any) {
      if (args.method === "alchemy_requestGasAndPaymasterAndData") {
        const [{ entryPoint }] = args.params;
        const isPMv7 =
          entryPoint.toLowerCase() ===
          paymaster070.entryPointAddress.toLowerCase();
        const paymaster = isPMv7 ? paymaster070 : paymaster060;

        // Ensure paymaster is deployed
        const paymasterAddress = paymaster.getPaymasterDetails().address;
        if (!deployedPaymasters.has(paymasterAddress)) {
          await paymaster.deployPaymasterContract(client);
          deployedPaymasters.add(paymasterAddress);
        }
      }

      // Delegate to the original transport
      return client.request(args);
    },
  });
};
