import Portal, { PortalOptions } from '@portal-hq/web'
import { createWalletClient, custom } from "viem";
import { polygonMumbai } from "viem/chains";
import {
  WalletClientSigner, type SmartAccountSigner 
} from "@alchemy/aa-core";


const portalOptions = {
  autoApprove: true,
  gatewayConfig: `${polygonMumbai.rpcUrls.alchemy.http}/${process.env.ALCHEMY_API_KEY}`,
  chainId: 80001,
  host: process.env.PORTAL_WEB_HOST,
} as PortalOptions 

const portal = new Portal(portalOptions)

const portalWalletClient = createWalletClient({
   transport: custom(portal.provider),
});
export const portalSigner: SmartAccountSigner = new WalletClientSigner(
   portalWalletClient
);
