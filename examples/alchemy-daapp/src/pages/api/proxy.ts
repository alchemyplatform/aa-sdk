import { NextApiRequest, NextApiResponse } from "next";
import { callEndpoint } from "~/http/http";
import { ALCHEMY_API_URL } from "~/settings";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    return res.send(await callEndpoint("POST", ALCHEMY_API_URL, req.body));
  } catch {
    return res.status(500).send("Internal Server Error");
  }
};
