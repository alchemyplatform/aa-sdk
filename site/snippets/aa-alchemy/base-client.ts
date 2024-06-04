import { createAlchemySmartAccountClient } from "@account-kit/core";
import { polygonMumbai } from "@alchemy/aa-core";

const chain = polygonMumbai;

export const smartAccountClient = createAlchemySmartAccountClient({
  apiKey: "demo",
  chain,
});
