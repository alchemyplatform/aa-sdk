import { ParticleSigner } from "@alchemy/aa-signers/particle";
import { ParticleNetwork } from "@particle-network/auth";
import { ParticleProvider } from "@particle-network/provider";

export const createParticleSigner = async () => {
  const particle = new ParticleNetwork({
    projectId: process.env.REACT_APP_PROJECT_ID as string,
    clientKey: process.env.REACT_APP_CLIENT_KEY as string,
    appId: process.env.REACT_APP_APP_ID as string,
    chainName: "polygon",
    chainId: 80001,
  });
  const particleProvider = new ParticleProvider(particle.auth);

  const particleSigner = new ParticleSigner({
    inner: particle,
    provider: particleProvider,
  });

  particleSigner.authenticate({
    loginOptions: {},
    login: async (loginOptions) => {
      particleSigner.inner.auth.login(loginOptions);
    },
  });

  return particleSigner;
};
