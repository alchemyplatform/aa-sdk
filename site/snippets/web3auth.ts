import { Web3AuthSigner } from "@alchemy/aa-signers";

export const createWeb3AuthSigner = async () => {
  const web3AuthSigner = new Web3AuthSigner({
    clientId: "test",
    chainConfig: {
      chainNamespace: "eip155",
    },
  });

  await web3AuthSigner.authenticate({
    init: async () => {
      await web3AuthSigner.inner.initModal();
    },
    connect: async () => {
      await web3AuthSigner.inner.connect();
    },
  });

  return web3AuthSigner;
};
