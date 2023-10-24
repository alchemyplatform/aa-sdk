import { ParticleNetwork } from '@particle-network/auth';
import { ParticleProvider } from '@particle-network/provider';
import { createWalletClient, custom } from 'viem';
import { WalletClientSigner, SmartAccountSigner } from '@alchemy/aa-core';

const particle = new ParticleNetwork({
	projectId: process.env.REACT_APP_PROJECT_ID as string,
	clientKey: process.env.REACT_APP_CLIENT_KEY as string,
	appId: process.env.REACT_APP_APP_ID as string,
	chainName: 'polygon',
	chainId: 80001,
});

const particleProvider = new ParticleProvider(particle.auth);

// Assumes user has logged in with something like particle.auth.login(), Particle Connect, or through other misc. connection

const particleWalletClient = createWalletClient({
	transport: custom(particleProvider),
});

export const particleSigner: SmartAccountSigner = new WalletClientSigner(
	particleWalletClient,
	'particle',
);
