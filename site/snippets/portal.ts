import { PortalSigner } from "@alchemy/aa-signers";
import { sepolia } from "viem/chains";

export const createPortalSigner = async () => {
  const portalSigner = new PortalSigner({
    autoApprove: true,
    gatewayConfig: `${sepolia.rpcUrls.alchemy.http}/${process.env.ALCHEMY_API_KEY}`,
    chainId: sepolia.id,
  });

  await portalSigner.authenticate();

  return portalSigner;
};
