import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Flex, Spinner} from "@chakra-ui/react";
import {useAddress} from "../../context/address";

export default function ProfileRedirect() {
  const navigate = useNavigate();
  const {address, hasAddress} = useAddress();
  useEffect(() => {
    if (hasAddress) {
      navigate(`/profile/${address}`);
    }
  }, [navigate, address, hasAddress]);

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
