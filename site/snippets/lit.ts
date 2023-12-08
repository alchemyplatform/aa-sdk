import {LitSigner} from '@alchemy/aa-signers';
import { polygonMumbai } from 'viem/chains';
import { AuthMethod } from '@lit-protocol/types';

const API_KEY = "<YOUR API KEY>";
const POLYGON_MUMBAI_RPC_URL = `${polygonMumbai.rpcUrls.alchemy.http[0]}/${API_KEY}`;
const PKP_PUBLIC_KEY = "<your pkp public key>";

const createLitSigner = async (props: {pkp: string, rpcUrl: string} = {pkp: PKP_PUBLIC_KEY, rpcUrl: POLYGON_MUMBAI_RPC_URL}) => {
  const litSigner = new LitSigner<AuthMethod>({
    pkpPublicKey: props.pkp,
    rpcUrl: props.rpcUrl,
  });

  return litSigner;
}