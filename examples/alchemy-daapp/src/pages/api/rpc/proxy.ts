import { NextApiRequest, NextApiResponse } from "next";
import { getApiUrl } from "~/configs/serverConfigs";
import { callEndpoint } from "~/http/http";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { chainId } = req.query;
  try {
    return res.send(
      await callEndpoint("POST", getApiUrl(chainId as string), req.body)
    );
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal Server Error");
  }
};
