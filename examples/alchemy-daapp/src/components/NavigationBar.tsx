import { Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Image from "next/image";

export default function NavigationBar() {
  return (
    <Flex
      padding="20px 10px"
      marginBottom="25px"
      justifyContent="center"
      alignItems="center"
      position="relative"
    >
      <Link to="/">
        <Image width={250} height={100} src="/logo.svg" alt="logo" />
      </Link>
    </Flex>
  );
}
