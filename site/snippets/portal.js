import { WalletClientSigner } from "@alchemy/aa-core";
import Portal from "@portal-hq/web";
import { createWalletClient, custom } from "viem";
import { polygonMumbai } from "viem/chains";
const portalOptions = {
    autoApprove: true,
    gatewayConfig: `${polygonMumbai.rpcUrls.alchemy.http}/${process.env.ALCHEMY_API_KEY}`,
    chainId: 80001,
    host: process.env.PORTAL_WEB_HOST,
};
const portal = new Portal(portalOptions);
const portalWalletClient = createWalletClient({
    transport: custom(portal.provider),
});
export const portalSigner = new WalletClientSigner(portalWalletClient, "portal" // signerType
);
