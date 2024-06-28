import { createAlchemySmartAccountClient } from "@account-kit/infra";
import { polygonMumbai } from "@aa-sdk/core";

const chain = polygonMumbai;

export const smartAccountClient = createAlchemySmartAccountClient({
  apiKey: "demo",
  chain,
});
