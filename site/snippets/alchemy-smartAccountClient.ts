import { createAlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { polygonMumbai } from "@alchemy/aa-core";

const chain = polygonMumbai;

export const provider = createAlchemySmartAccountClient({
  apiKey: "demo",
  chain,
});
