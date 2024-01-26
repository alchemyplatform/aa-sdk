import { ArcanaAuthSigner } from "@alchemy/aa-signers/arcana-auth";

// See https://docs.arcana.network/quick-start/vue-quick-start#step-3-integrate-app for details.
const clientId = "xar_test_...";

export const createArcanaAuthSigner = async () => {
  const arcanaAuthSigner = new ArcanaAuthSigner({ clientId, params: {} });

  await arcanaAuthSigner.authenticate({
    async init() {
      await arcanaAuthSigner.inner.init();
    },
    async connect() {
      await arcanaAuthSigner.inner.connect();
    },
  });

  return arcanaAuthSigner;
};
