import { NextApiRequest, NextApiResponse } from "next";
import { callEndpoint } from "~/http/http";
import { ALCHEMY_API_URL, NFT_CONTRACT_ADDRESS } from "~/settings";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    address,
  }: {
    address?: string;
  } = req.query;
  try {
    const repsonse = await callEndpoint(
      "GET",
      `${ALCHEMY_API_URL}/getNFTs/?owner=${address}&contractAddresses[]=${NFT_CONTRACT_ADDRESS}`
    );
    return res.send(repsonse);
  } catch (e) {
    console.error(e);
    return res.status(400).send((e as Error).message);
  }
};
