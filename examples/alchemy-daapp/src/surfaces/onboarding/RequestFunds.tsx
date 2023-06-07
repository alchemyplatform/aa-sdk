import { Box, Code, Text } from "@chakra-ui/react";
import { Chain } from "viem";
import { polygonMumbai, sepolia } from "viem/chains";
import { toast } from "~/utils/toast";

export function RequestFunds({
  chain,
  address,
}: {
  chain: Chain;
  address: string;
}) {
  return (
    <Box>
      <Text>
        You need some {chain.nativeCurrency.symbol} to pay for the transaction.
      </Text>
      <br />
      <Text>
        Copy this address:{" "}
        <Code
          color="blue"
          cursor={"pointer"}
          onClick={() => {
            navigator.clipboard.writeText(address);
            toast({
              title: "Address copied to clipboard",
              status: "success",
              duration: 3000,
            });
          }}
        >
          <b>{address}</b>
        </Code>{" "}
        and please request some from{" "}
        {chain.id === polygonMumbai.id ? (
          <a
            href="https://mumbaifaucet.com"
            target="_blank"
            style={{ color: "blue", textDecoration: "underline" }}
          >
            our mumbai faucet
          </a>
        ) : chain.id === sepolia.id ? (
          <a
            href="https://sepoliafaucet.com"
            target="_blank"
            style={{ color: "blue", textDecoration: "underline" }}
          >
            our sepolia faucet
          </a>
        ) : (
          "a faucet for this chain"
        )}
        .
      </Text>
      <br />
      <Text>
        Once you have more than <Code>.1 {chain.nativeCurrency.symbol}</Code>,
        the step will automatically progress!
      </Text>
    </Box>
  );
}
