import { NextApiRequest, NextApiResponse } from "next";
import { daappConfigurations } from "~/configs/clientConfigs";
import { getApiUrl } from "~/configs/serverConfigs";
import { callEndpoint } from "~/http/http";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    address,
  }: {
    address?: string;
  } = req.query;
  try {
    const chainId = req.query.chainId;
    if (!chainId) {
      throw new Error("chainId is required");
    }

    if (!address) {
      throw new Error('address is required')
    }

    const contractAddress =
      daappConfigurations[Number(chainId)]?.nftContractAddress;
    if (!contractAddress) {
      throw new Error("Unsupported chainID.");
    }

    const response = await callEndpoint(
      "GET",
      `${getApiUrl(
        chainId as string
      )}/getNFTs/?owner=${address}&contractAddresses[]=${contractAddress}`
    );
    return res.send(response);
  } catch (e) {
    console.error(e);
    return res.status(400).send((e as Error).message);
  }
};
