import { useEffect } from "react";
import { useRouter } from "next/router";
import { Flex, Spinner } from "@chakra-ui/react";
import { useAccount } from "wagmi";

export default function ProfileRedirect() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  useEffect(() => {
    if (isConnected) {
      router.push(`/profile/${address}`);
    }
  }, [router, address, isConnected]);

  return (
    <Flex
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner />
    </Flex>
  );
}
